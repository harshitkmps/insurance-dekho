import LosService from "./los-service";
import ApiPosService from "./apipos-service";
import LeadAddService from "./lead-add-service";
import DocumentService from "../core/api-helpers/document-service";
import _ from "lodash";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { UseCache } from "../decorators/use-cache.decorator";
import pkceChallenge from "pkce-challenge";
import {
  LeadStatus,
  TrainingStatus,
  mapDocType,
  rejectionStatusMapping,
  statusMappings,
  trainingEventPropertyMapping,
  trainingStatusMapping,
  validationErrors,
  docRejectMap,
  DocStatus,
  DocType,
  AddType,
  AddDetailsKeys,
  StudyMaterialLink,
} from "../constants/los.constants";
import CommonUtils from "../utils/common-utils";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { USER_REASON_FOR_DEACTIVATION_MAPPING } from "../constants/config.constants";

const getLosInsuranceType = (typeId) => {
  if (typeId == 1) return "GENERAL";
  else if (typeId == 2) return "LIFE";
  else return "NONE";
};

const createBodyForAdditionalDetailsUpdate = (object) => {
  const data = [];
  for (const [key, value] of Object.entries(object)) {
    data.push({
      name: key,
      value: value,
    });
  }
  return { data };
};

@Injectable()
export default class LeadOnboardingService {
  constructor(
    private losService: LosService,
    private apiPosService: ApiPosService,
    private leadAddService: LeadAddService,
    private documentService: DocumentService
  ) {}

  public async fetchDocumentServiceLink(headers, docId): Promise<any> {
    const docRequest = {
      headers,
      body: { doc_ids: [docId] },
    };
    const virtualDocIdResponse = await this.leadAddService.addRegisterDocument(
      docRequest
    );
    return (
      `${process.env.DOC_SERVICE_URL}doc-service/v1/documents/` +
      virtualDocIdResponse.data.docs[0]
    );
  }

  public async fetchDocumentServiceLinkV2(headers: any, docId: string) {
    try {
      const docServiceResponse =
        await this.documentService.addRegisterDocumentV2(headers, docId);
      const doc = docServiceResponse?.data?.docs?.[0] ?? {};
      const { file_extension: fileExtension, access_id: accessId } = doc;
      return {
        fileExtension,
        link:
          `${process.env.DOC_SERVICE_URL}doc-service/v1/documents/` + accessId,
      };
    } catch (error) {
      Logger.error("Error while creating virtual doc Id", { error });
    }
  }

  private async transformKycResponse(headers, leadDetails) {
    const transformedResponse = {
      latitude: null,
      longitude: null,
      currentOnboardingStatus: "incomplete_leads",
      currentOnboardingMsg: "Complete KYC",
      kycStatusMsg: "KYC in process",
      leadId: leadDetails.lead.uuid,
      panDetails: {
        name: leadDetails.lead.name,
        pan_number: leadDetails.leadProfile.pan,
        date_of_birth: "1997-12-03T00:00:00.000Z", // to be changed!!
        is_ckyc_fetched: false,
        maximum_attempt: 0,
        politically_exposed_consent: 1,
        status: "invalid",
        pan: "",
        file_type: "",
      },
      aadharDetails: {
        aadhar_number: null,
        pin_code: "",
        city_id: null,
        city_name: "",
        state_id: null,
        state_name: "",
        address: "",
        locality: null,
        af_doc_status: {
          doc_status: "invalid",
        },
        ab_doc_status: {
          doc_status: "invalid",
        },
        aadhar_front: "",
        aadhar_front_type: "",
        aadhar_back: "",
        aadhar_back_type: "",
        status: "invalid",
      },
    };
    const panDocument = _.find(leadDetails.documents, {
      type: "PAN",
    });
    const aadhaarFrontDocument = _.find(leadDetails.documents, {
      type: "AADHAAR_FRONT",
    });
    const aadhaarBackDocument = _.find(leadDetails.documents, {
      type: "AADHAAR_BACK",
    });
    if (panDocument && panDocument.documentId) {
      const { link, fileExtension } = await this.fetchDocumentServiceLinkV2(
        headers,
        panDocument.documentId
      );
      transformedResponse.panDetails.pan = link;
      transformedResponse.panDetails.file_type = fileExtension;
      transformedResponse.panDetails.is_ckyc_fetched = true;
    }
    if (aadhaarFrontDocument) {
      const { link, fileExtension } = await this.fetchDocumentServiceLinkV2(
        headers,
        aadhaarFrontDocument.documentId
      );
      transformedResponse.aadharDetails.aadhar_front = link;
      transformedResponse.aadharDetails.aadhar_front_type = fileExtension;
      transformedResponse.aadharDetails.af_doc_status.doc_status = "valid";
    }
    if (aadhaarBackDocument) {
      const { link, fileExtension } = await this.fetchDocumentServiceLinkV2(
        headers,
        aadhaarBackDocument.documentId
      );
      transformedResponse.aadharDetails.aadhar_back = link;
      transformedResponse.aadharDetails.aadhar_back_type = fileExtension;
      transformedResponse.aadharDetails.af_doc_status.doc_status = "valid";
    }
    if (aadhaarFrontDocument && aadhaarBackDocument) {
      transformedResponse.aadharDetails.status = "valid";
    }
    if (leadDetails.lead.status == "REGISTRATION_REQUESTED") {
      transformedResponse.currentOnboardingStatus = "in_review";
      transformedResponse.currentOnboardingMsg =
        "Your documents are being reviewed by our team. Verification usually takes 24 hours.";
      transformedResponse.kycStatusMsg = "KYC in review";
    }
    const homeAddress = _.find(leadDetails.addresses, {
      type: "HOME",
    });
    if (homeAddress) {
      transformedResponse.aadharDetails.pin_code = homeAddress.pincode;
      transformedResponse.aadharDetails.city_id = homeAddress.cityId;
      transformedResponse.aadharDetails.city_name = homeAddress.cityId;
      transformedResponse.aadharDetails.state_id = homeAddress.stateId;
      transformedResponse.aadharDetails.state_name = homeAddress.stateId;
      transformedResponse.aadharDetails.address = homeAddress.address;
      transformedResponse.aadharDetails.locality = homeAddress.locality;
    }
    const obj = {
      leadData: transformedResponse,
    };
    return obj;
  }

  public async parseLeadDetailResponse(leadDetails: any, headers: any) {
    Logger.debug(`transforming response for lead ${leadDetails.uuid}`);
    const parsedResponse = {
      basicDetails: {
        name: "",
        email: "",
        city_id: "",
        city_name: "",
        uuid: "",
        is_whatsapp_consent: false,
        is_experienced: false,
      },
      completedScreens: {
        pan: false,
        aadhar: false,
        nocPan: true,
        photo: false,
        bank: false,
        education: false,
        business: false,
        all: false,
      },
      currentOnboardingStatus: "",
      currentOnboardingMsg: "",
      currentOnboardingBtn: "",
      kycStatusMsg: "",
      redirectionLink: "",
      isReRegister: false,
      isNocRequired: false,
      isPanFetched: false,
      isAadhaarVerified: false,
      bankAccountVerified: false,
      educationDetails: {
        qualificationId: "",
        certificateImage: "",
        certificateImageType: "",
        status: "",
        errMsg: "",
      },
      photoDetails: {
        photoImage: "",
        photoImageType: "",
        isFetched: false,
        status: "",
        errMsg: "",
      },
      personalDetails: {
        pinCode: "",
        address: "",
        locality: "",
        latitude: "",
        longitude: "",
        cityName: "",
        stateName: "",
        city: "",
        state: "",
        aadharFrontImage: "",
        aadharBackImage: "",
        aadharFrontImageType: "",
        aadharBackImageType: "",
        panNo: "",
        aadharNo: "XXXX-XXXX-XXXX",
        DOB: "",
        fullName: "",
        isPoliticaly: false,
        panImage: "",
        panImageType: "",
        panStatus: "",
        panReason: "",
        panErrMsg: "",
        aadharStatus: "",
        nocImage: "",
        nocImageType: "",
        nocStatus: "",
        nocErrMsg: "",
        afStatus: {},
        abStatus: {},
      },
      bankDetails: {
        bankName: "",
        accountNo: "",
        IFSCCode: "",
        accountConsent: false,
        isJointAccount: "",
      },
      businessDetails: {
        GSTINNo: "",
        pinCode: "",
        address: "",
        locality: "",
        cityName: "",
        stateName: "",
        sameWorkAddress: false,
        gst_reg: false,
      },
      trainingData: {},
    };
    // parse response
    const {
      lead,
      leadProfile,
      bankDetails,
      addresses,
      documents,
      additionalDetails,
      trainings,
    } = leadDetails;

    if (!lead) {
      return {};
    }

    // const remarks = await this.losService.fetchRemarks();
    const addDetailsMap = additionalDetails.reduce((acc, detail) => {
      acc[detail.name] = detail.value;
      return acc;
    }, {});
    parsedResponse.isReRegister =
      addDetailsMap[AddDetailsKeys.RE_REGISTER] === "1";
    parsedResponse.isNocRequired =
      addDetailsMap[AddDetailsKeys.NOC_REQUIRED] === "1";
    if (lead) {
      parsedResponse.basicDetails = {
        name: lead.name,
        email: lead.emailMasked,
        city_id: lead.cityId,
        city_name: "",
        uuid: lead.uuid,
        is_whatsapp_consent: lead.isWhatsappConsent,
        is_experienced: lead.isExperienced || false,
      };
      parsedResponse.personalDetails.fullName = lead.name;
      parsedResponse.currentOnboardingStatus = lead.status;
    }

    if (leadProfile) {
      const panDocument = documents.find((doc) => doc.type === DocType.PAN);
      if (panDocument) {
        parsedResponse.completedScreens.pan = true;
        parsedResponse.isPanFetched = true;
        if (panDocument.documentId) {
          const { link, fileExtension } = await this.fetchDocumentServiceLinkV2(
            headers,
            panDocument.documentId
          );
          parsedResponse.personalDetails.panImage = link;
          parsedResponse.personalDetails.panImageType = fileExtension;
        } else {
          parsedResponse.personalDetails.panImage = panDocument.url;
        }
        if (panDocument.status === DocStatus.REJECTED) {
          parsedResponse.completedScreens.pan = false;
          parsedResponse.isPanFetched = false;
          parsedResponse.personalDetails.panStatus = "invalid";
          parsedResponse.personalDetails.panErrMsg =
            docRejectMap[panDocument.remarkId];
        }
      }

      parsedResponse.educationDetails.qualificationId =
        leadProfile.educationDetails;
      parsedResponse.personalDetails.panNo =
        leadProfile.pan || leadProfile.panMasked;
      parsedResponse.personalDetails.DOB = leadProfile.dateOfBirth
        ? leadProfile.dateOfBirth
        : "";
    }

    if (parsedResponse.isReRegister && parsedResponse.isNocRequired) {
      //isPanFetched- > do we return existing pan details
      parsedResponse.completedScreens.nocPan = false;
      parsedResponse.isPanFetched = false;
      const panNocDocument = documents.find(
        (doc) => doc.type === DocType.PAN_NOC
      );
      if (panNocDocument) {
        parsedResponse.completedScreens.nocPan = true;
        parsedResponse.isPanFetched = true;
        if (panNocDocument.documentId) {
          const { link, fileExtension } = await this.fetchDocumentServiceLinkV2(
            headers,
            panNocDocument.documentId
          );
          parsedResponse.personalDetails.nocImage = link;
          parsedResponse.personalDetails.nocImageType = fileExtension;
        } else {
          parsedResponse.personalDetails.nocImage = panNocDocument.url;
        }
        if (panNocDocument.status === DocStatus.REJECTED) {
          parsedResponse.completedScreens.nocPan = false;
          parsedResponse.personalDetails.nocStatus = "invalid";
          parsedResponse.personalDetails.nocErrMsg =
            docRejectMap[panNocDocument.remarkId];
        }
      }
    }

    const aadhaarFrontDocument = documents.find(
      (doc) => doc.type === DocType.AADHAAR_FRONT
    );
    const aadhaarBackDocument = documents.find(
      (doc) => doc.type === DocType.AADHAAR_BACK
    );

    parsedResponse.isAadhaarVerified =
      aadhaarFrontDocument?.source === DocStatus.AUTOMATED &&
      aadhaarBackDocument?.source === DocStatus.AUTOMATED &&
      aadhaarFrontDocument?.status !== DocStatus.REJECTED &&
      aadhaarBackDocument?.status !== DocStatus.REJECTED;

    parsedResponse.completedScreens.aadhar =
      aadhaarFrontDocument && aadhaarBackDocument ? true : false;

    if (aadhaarFrontDocument) {
      if (aadhaarFrontDocument.documentId) {
        const { link, fileExtension } = await this.fetchDocumentServiceLinkV2(
          headers,
          aadhaarFrontDocument.documentId
        );
        parsedResponse.personalDetails.aadharFrontImage = link;
        parsedResponse.personalDetails.aadharFrontImageType = fileExtension;
      } else {
        parsedResponse.personalDetails.aadharFrontImage =
          aadhaarFrontDocument.url;
      }
      if (aadhaarFrontDocument.status === DocStatus.REJECTED) {
        parsedResponse.completedScreens.aadhar = false;
        parsedResponse.personalDetails.aadharStatus = "invalid";
        parsedResponse.personalDetails.afStatus = {
          doc_status: "invalid",
          error_msg: docRejectMap[aadhaarFrontDocument.remarkId],
        };
      }
    }
    if (aadhaarBackDocument) {
      if (aadhaarBackDocument.documentId) {
        const { link, fileExtension } = await this.fetchDocumentServiceLinkV2(
          headers,
          aadhaarBackDocument.documentId
        );
        parsedResponse.personalDetails.aadharBackImage = link;
        parsedResponse.personalDetails.aadharBackImageType = fileExtension;
      } else {
        parsedResponse.personalDetails.aadharBackImage =
          aadhaarBackDocument.url;
      }
      if (aadhaarBackDocument.status === DocStatus.REJECTED) {
        parsedResponse.completedScreens.aadhar = false;
        parsedResponse.personalDetails.aadharStatus = "invalid";
        parsedResponse.personalDetails.abStatus = {
          doc_status: "invalid",
          error_msg: docRejectMap[aadhaarBackDocument.remarkId],
        };
      }
    }

    const agentPhoto = documents.find((doc) => doc.type === DocType.USER_PHOTO);
    if (agentPhoto) {
      parsedResponse.completedScreens.photo = true;
      parsedResponse.photoDetails.isFetched =
        agentPhoto.source === DocStatus.AUTOMATED;
      if (agentPhoto.documentId) {
        const { link, fileExtension } = await this.fetchDocumentServiceLinkV2(
          headers,
          agentPhoto.documentId
        );
        parsedResponse.photoDetails.photoImage = link;
        parsedResponse.photoDetails.photoImageType = fileExtension;
      } else {
        parsedResponse.photoDetails.photoImage = agentPhoto.url;
      }
      if (agentPhoto.status === DocStatus.REJECTED) {
        parsedResponse.completedScreens.photo = false;
        parsedResponse.photoDetails.status = "invalid";
        parsedResponse.photoDetails.errMsg = docRejectMap[agentPhoto.remarkId];
      }
    }

    const educationDocument = documents.find(
      (doc) => doc.type === DocType.EDUCATION_CERTIFICATE
    );
    if (educationDocument) {
      parsedResponse.completedScreens.education = true;
      if (educationDocument.documentId) {
        const { link, fileExtension } = await this.fetchDocumentServiceLinkV2(
          headers,
          educationDocument.documentId
        );
        parsedResponse.educationDetails.certificateImage = link;
        parsedResponse.educationDetails.certificateImageType = fileExtension;
      } else {
        parsedResponse.educationDetails.certificateImage =
          educationDocument.url;
      }
      if (!leadProfile?.educationDetails) {
        parsedResponse.completedScreens.education = false;
      }
      if (educationDocument.status === DocStatus.REJECTED) {
        parsedResponse.completedScreens.education = false;
        parsedResponse.educationDetails.status = "invalid";
        parsedResponse.educationDetails.errMsg =
          docRejectMap[educationDocument.remarkId];
      }
    }

    const activeBankDetails = _.find(bankDetails, {
      isActive: true,
    });
    if (activeBankDetails) {
      parsedResponse.bankDetails = {
        bankName: activeBankDetails.bankName,
        accountNo: activeBankDetails.accountNumberMasked,
        IFSCCode: activeBankDetails.ifsc,
        accountConsent: activeBankDetails.isConsent || true,
        isJointAccount: activeBankDetails.isJointAccount,
      };
      parsedResponse.completedScreens.bank =
        activeBankDetails.isBankVerified || false;
      // parsedResponse.completedScreens.bank = true; // disable later
      parsedResponse.bankAccountVerified =
        activeBankDetails.isBankVerified || false;
    }

    const homeAddress = addresses.find((add) => add.type === AddType.HOME);
    if (homeAddress) {
      parsedResponse.personalDetails.pinCode = homeAddress.pincode;
      parsedResponse.personalDetails.address = homeAddress.address;
      parsedResponse.personalDetails.locality = homeAddress.locality;
      parsedResponse.personalDetails.cityName = homeAddress.cityId;
      parsedResponse.personalDetails.stateName = homeAddress.stateId;
      parsedResponse.personalDetails.city = homeAddress.cityId;
      parsedResponse.personalDetails.state = homeAddress.stateId;
    } else {
      parsedResponse.completedScreens.aadhar = false;
    }

    const workAddress = addresses.find((add) => add.type === AddType.WORK);
    if (workAddress) {
      parsedResponse.businessDetails.pinCode = workAddress.pincode;
      parsedResponse.businessDetails.address = workAddress.address;
      parsedResponse.businessDetails.locality = workAddress.locality;
      parsedResponse.businessDetails.cityName = workAddress.cityId;
      parsedResponse.businessDetails.stateName = workAddress.stateId;
      parsedResponse.businessDetails.pinCode = workAddress.pincode;
      parsedResponse.businessDetails.GSTINNo = workAddress.gstNumber;
      parsedResponse.businessDetails.gst_reg = !!workAddress.gstNumber;
      if (
        homeAddress &&
        workAddress.pincode == homeAddress.pincode &&
        workAddress.address == homeAddress.address &&
        workAddress.locality == homeAddress.locality &&
        workAddress.locality
      ) {
        parsedResponse.businessDetails.sameWorkAddress = true;
      }
      parsedResponse.completedScreens.business = true;
    }

    parsedResponse.basicDetails.is_whatsapp_consent =
      addDetailsMap[AddDetailsKeys.WHATSAPP_CONSENT] === "1";
    parsedResponse.basicDetails.is_experienced =
      addDetailsMap[AddDetailsKeys.EXPERIENCED] === "1";
    parsedResponse.personalDetails.isPoliticaly =
      addDetailsMap[AddDetailsKeys.POLITICALLY_EXPOSED] === "1";

    const {
      currentOnboardingStatus,
      kycStatusMsg,
      currentOnboardingBtn,
      currentOnboardingMsg,
      redirectionLink,
    } = this.getMessageAndButtonInfo(lead);
    parsedResponse.currentOnboardingStatus = currentOnboardingStatus ?? "";
    parsedResponse.kycStatusMsg = kycStatusMsg ?? "";
    parsedResponse.currentOnboardingBtn = currentOnboardingBtn ?? "";
    parsedResponse.currentOnboardingMsg = currentOnboardingMsg ?? "";
    parsedResponse.redirectionLink = redirectionLink ?? "";

    parsedResponse.completedScreens.all =
      parsedResponse.completedScreens.pan &&
      parsedResponse.completedScreens.aadhar &&
      parsedResponse.completedScreens.photo &&
      parsedResponse.completedScreens.education &&
      parsedResponse.completedScreens.bank &&
      parsedResponse.completedScreens.nocPan;
    parsedResponse.trainingData = trainings;

    return parsedResponse;
  }

  private getMessageAndButtonInfo(lead: any) {
    const trainings = lead?.trainings;
    const leadStatus = lead?.status ?? "";
    const trainingStatus =
      trainings && trainings.length > 0 ? trainings[0]?.status : "";
    const leadRejectionId = lead?.rejectionRemarksId ?? "";
    const leadRejectionReason = lead?.rejectionReason ?? null;

    let statusValues = statusMappings[leadStatus];
    if (leadStatus === LeadStatus.REJECTED) {
      if (leadRejectionReason) {
        statusValues.currentOnboardingMsg = leadRejectionReason;
      }
      statusValues = {
        ...statusValues,
        ...rejectionStatusMapping[leadRejectionId],
      };
    } else if (leadStatus === LeadStatus.VERIFIED) {
      statusValues = {
        ...statusValues,
        ...trainingStatusMapping[trainingStatus],
      };
    }
    return statusValues ?? {};
  }

  public async createLead(data): Promise<any> {
    if (
      CommonUtils.isEmpty(data.cityId) &&
      !CommonUtils.isEmpty(data.pincode)
    ) {
      data.cityId = await this.apiPosService.getCityIdByPincode(data.pincode);
    }
    const leadResponse: any = await this.losService.createLead(data);
    const leadId = leadResponse.data.uuid;
    await this.updateLeadAdditionalDetails(leadId, data?.additionalDetails);
    return leadResponse;
  }

  public async updateLead(leadId, data): Promise<any> {
    const leadupdateResponse = await this.losService.updateLead(leadId, data);
    await this.updateLeadAdditionalDetails(leadId, data?.additionalDetails);
    return leadupdateResponse.data;
  }

  public async fetchCkycDetails(leadId, options): Promise<any> {
    Logger.debug("fetching kyc details from los for leadId" + leadId, options);
    const headers = options.headers;
    const data = options.body;
    const response = await this.losService.fetchLeadKYC(leadId, data);
    await this.updateLeadAdditionalDetails(leadId, data?.additionalDetails);
    const transformResponse = await this.transformKycResponse(
      headers,
      response.data
    );
    return transformResponse;
  }

  public async updatePanAndName(leadId, data): Promise<any> {
    /*const updateNameBody = {
      name: data.name,
    };
    await this.losService.updateLead(leadId, updateNameBody);*/
    const { panDocumentId } = data;
    if (panDocumentId) {
      const updateDocumentBody = {
        documentId: panDocumentId,
        documentType: "PAN",
        documentSource: "MANUAL",
      };
      await this.losService.updateDocument(leadId, updateDocumentBody);
    }
    return;
  }

  public async updateNoc(leadId, data): Promise<any> {
    const { nocDocumentId } = data;
    if (nocDocumentId) {
      const updateDocumentBody = {
        documentId: nocDocumentId,
        documentType: "PAN_NOC",
        documentSource: "MANUAL",
      };
      await this.losService.updateDocument(leadId, updateDocumentBody);
    }
    return;
  }

  public async updateAadhaarDetails(leadId, data): Promise<any> {
    const aadhaarFrontDocId = data.aadhaarFrontDocId;
    const aadhaarBackDocId = data.aadhaarBackDocId;
    if (aadhaarFrontDocId) {
      const updateDocumentBody = {
        documentId: aadhaarFrontDocId,
        documentType: "AADHAAR_FRONT",
        documentSource: "MANUAL",
      };
      await this.losService.updateDocument(leadId, updateDocumentBody);
    }
    if (aadhaarBackDocId) {
      const updateDocumentBody = {
        documentId: aadhaarBackDocId,
        documentType: "AADHAAR_BACK",
        documentSource: "MANUAL",
      };
      await this.losService.updateDocument(leadId, updateDocumentBody);
    }
    const addressObject = {
      cityId: data.cityId,
      stateId: data.stateId,
      locality: data.locality,
      pincode: data.pincode,
      fullAddress: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    };
    const updateAddressBody = {
      addresses: [{ ...addressObject, type: "HOME" }],
    };
    await this.losService.updateAddress(leadId, updateAddressBody);
    return;
  }

  public async updatePhoto(leadId, data): Promise<any> {
    const updateDocumentBody = {
      documentId: data.photoDocId,
      documentType: "USER_PHOTO",
      documentSource: "MANUAL",
    };
    await this.losService.updateDocument(leadId, updateDocumentBody);
    return;
  }

  public async updateEducationDetails(leadId, data): Promise<any> {
    if (data.educationCertificateDocId) {
      const updateDocumentBody = {
        documentId: data.educationCertificateDocId.toString(),
        documentType: "EDUCATION_CERTIFICATE",
        documentSource: "MANUAL",
      };
      await this.losService.updateDocument(leadId, updateDocumentBody);
    }
    const updateProfileBody = {
      educationDetails: data.educationDetails,
    };
    await this.losService.updateLeadProfile(leadId, updateProfileBody);
    return;
  }

  public async deactivateUserForReRegistration(uuid): Promise<any> {
    try {
      const requestBody = {
        is_active: "0",
        reason_of_inactivation:
          USER_REASON_FOR_DEACTIVATION_MAPPING.RE_REGISTRATION_PROCESS.STATUS,
        date_of_inactivation: new Date(),
      };
      await this.apiPosService.updateUserDetails(uuid, requestBody);
    } catch (err) {
      Logger.error(`some error occurred in deactivate user details ${err}`);
    }
  }

  public async migrateLead(leadId): Promise<any> {
    const losResponse = await this.losService.reRegisterLead(leadId);
    await this.deactivateUserForReRegistration(leadId);
    return losResponse;
  }

  public async updateWorkDetails(leadId, data): Promise<any> {
    // gst details to be added
    const addressObject = {
      cityId: data.cityId,
      stateId: data.stateId,
      locality: data.locality,
      pincode: data.pincode,
      fullAddress: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    };
    if (data.isGstRegistered) {
      addressObject["gstNumber"] = data.gstNumber;
    }
    const updateAddressBody = {
      addresses: [{ ...addressObject, type: "WORK" }],
      requestForQC: true,
    };
    const responseData = await this.losService.updateAddress(
      leadId,
      updateAddressBody
    );
    return responseData;
  }

  public async getTrainingConfiguration(leadId, insuranceTypes): Promise<any> {
    const leadData = await this.losService.fetchLeadDetails(leadId, {});
    if (CommonUtils.isEmpty(leadData)) return [];
    const { trainings, timestamps } = leadData;
    const allPromises = [];
    for (let i = 0; i < insuranceTypes.length; i++) {
      allPromises.push(
        this.getTrainingData(leadId, insuranceTypes[i], trainings, timestamps)
      );
    }
    const trainingData = await Promise.all(allPromises);
    return trainingData;
  }

  public async getTrainingData(
    leadId,
    insuranceType,
    trainings,
    timestamps
  ): Promise<any> {
    const losInsuranceType = getLosInsuranceType(insuranceType);
    const responseData: any = {
      status: TrainingStatus.TRAINING_MATERIAL_SHARED,
      insuranceType: insuranceType,
      studyMaterialLink: StudyMaterialLink[losInsuranceType],
    };
    const requestedTraining = trainings.find(
      (training) => training.insuranceType === losInsuranceType
    );
    if (!requestedTraining) {
      await this.shareTrainingMaterials(leadId, [insuranceType]);
      return responseData;
    }
    const status = requestedTraining.status;
    const event = `${losInsuranceType}_${status}`;
    const eventObject = timestamps.find(
      (timestamp) => timestamp.event === event
    );
    if (eventObject) {
      responseData[trainingEventPropertyMapping[status]] =
        eventObject.timeStamp;
    }
    responseData.status = status;
    if (
      status === TrainingStatus.TEST_FAILED ||
      status === TrainingStatus.COMPLETED
    ) {
      responseData.evaluationData = await this.apiPosService.fetchTestScore(
        leadId,
        insuranceType
      );
    }
    return responseData;
  }

  public async fetchLeadDetailsForSelfOnboarding(
    leadId,
    options
  ): Promise<any> {
    Logger.debug(
      `fetching lead details for self onboarding for lead ${leadId}`
    );
    const leadDetails = await this.losService.fetchLeadDetails(leadId, {});
    const { headers } = options;
    const parsedResponse = await this.parseLeadDetailResponse(
      leadDetails,
      headers
    );
    return parsedResponse;
  }

  public async updateBankDetails(leadId, data): Promise<any> {
    Logger.debug("updating bank details for lead" + leadId, data);
    try {
      const updateBankDetailsBody = {
        ifsc: data.ifsc,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        isAccountConsent: data.isAccountConsent,
        doPennyTesting: data.doPennyTesting || 1,
        requestForQC: true,
        isJointAccount: data.isJointAccount,
      };
      const response = await this.losService.updateBankDetails(
        leadId,
        updateBankDetailsBody
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error?.message || "Some Error Occurred",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  public async getTrainingMaterialLink(leadId, insuranceType): Promise<any> {
    Logger.debug(
      `get training material for lead ${leadId} and insuranceType ${insuranceType}`
    );
    const leadDetails = await this.losService.fetchLeadDetails(leadId, {});
    const losInsuranceType = getLosInsuranceType(insuranceType);
    const { trainings } = leadDetails;
    const trainingData = _.find(trainings, {
      insuranceType: losInsuranceType,
    });
    if (!trainingData) {
      throw new HttpException(
        "you are not allowed to download training material",
        HttpStatus.BAD_REQUEST
      );
    }
    if (trainingData.status === TrainingStatus.TRAINING_MATERIAL_SHARED) {
      const body = {
        insuranceType: losInsuranceType,
        status: TrainingStatus.TRAINING_MATERIAL_DOWNLOADED,
      };
      await this.losService.updateTrainingStatus(leadId, body);
    }
    const downloadLink = StudyMaterialLink[losInsuranceType];
    return downloadLink;
  }

  public async startTest(leadId: string, insuranceType: string): Promise<any> {
    Logger.debug(
      `start test for lead ${leadId} and insuranceType ${insuranceType}`
    );
    const losInsuranceType = getLosInsuranceType(insuranceType);
    const leadDetails: any = await this.losService.fetchLeadDetails(leadId, {});
    const { trainings } = leadDetails;
    const trainingData = _.find(trainings, {
      insuranceType: losInsuranceType,
    });
    if (
      !trainingData ||
      !_.includes(
        ["TEST_LINK_SHARED", "TEST_FAILED", "TRAINING_MATERIAL_DOWNLOADED"],
        trainingData.status
      )
    ) {
      throw new HttpException(
        "You are not allowed to take test, please contact admin",
        HttpStatus.FORBIDDEN
      );
    }
    const questions = await this.apiPosService.fetchQuestions(insuranceType);
    return questions;
  }

  public async clearTest(params, insuranceType): Promise<any> {
    const leadId = params.leadId;
    const uuid = params.uuid;
    const evaluationRequestBody = { uuid, insuranceType };
    const evaluation: any = await this.apiPosService.clearLeadTest(
      evaluationRequestBody
    );

    let trainingStatus;
    if (evaluation.examCleared) {
      trainingStatus = "COMPLETED";
    } else {
      trainingStatus = "TEST_FAILED";
    }
    const losInsuranceType = getLosInsuranceType(insuranceType);
    const updateTrainingStatusBody = {
      insuranceType: losInsuranceType,
      status: trainingStatus,
    };

    const response = await this.losService.updateTrainingStatus(
      uuid,
      updateTrainingStatusBody
    );
    Logger.debug(`Lead status updated on LOS:  ${response.message}`);
    return { evaluation, trainingStatus, leadId, losInsuranceType };
  }

  public async submitTest(leadId, insuranceType, answerObject): Promise<any> {
    // validate if user is allowed to submit the test
    // evaluate the submission
    const evaluationRequestBody = {
      uuid: leadId,
      insuranceType: insuranceType,
      answerObject: answerObject,
    };
    const evaluation: any =
      await this.apiPosService.evaluateAndSubmitTestSubmission(
        evaluationRequestBody
      );
    let trainingStatus;
    if (evaluation.examCleared) {
      trainingStatus = "COMPLETED";
    } else {
      trainingStatus = "TEST_FAILED";
    }
    const losInsuranceType = getLosInsuranceType(insuranceType);
    const updateTrainingStatusBody = {
      insuranceType: losInsuranceType,
      status: trainingStatus,
    };
    Logger.debug("updateTrainingStatusBody", updateTrainingStatusBody);
    await this.losService.updateTrainingStatus(
      leadId,
      updateTrainingStatusBody
    );
    return { evaluation, trainingStatus };
  }

  public async sendForRegistration(leadId): Promise<any> {
    const body = {
      leadId: leadId,
      leadTrigger: "REQUEST_FOR_REGISTRATION",
    };
    try {
      await this.losService.triggerEvent(body);
      return true;
    } catch (error) {
      // handle gracefully, nothing to worry
      return false;
    }
  }

  public async shareTrainingMaterials(leadId, insuranceTypes): Promise<any> {
    for (let i = 0; i < insuranceTypes.length; i++) {
      const body = {
        insuranceType: getLosInsuranceType(insuranceTypes[i]),
        status: TrainingStatus.TRAINING_MATERIAL_SHARED,
      };
      await this.losService.updateTrainingStatus(leadId, body);
    }
  }

  public async fetchKycDetails(request: ReqWithUser): Promise<any> {
    try {
      Logger.debug("Inside FetchKycdetails Service");
      const response = {};
      const uuid = request.userInfo?.uuid;
      const pkce = await this.getPkce(uuid);
      const digilockerDetails = await this.losService.fetchDigilockerDetails(
        request.query,
        pkce?.code_verifier
      );
      Logger.debug(
        "LOS API response" + digilockerDetails,
        JSON.stringify(digilockerDetails)
      );
      if (digilockerDetails?.data?.addressDetails) {
        Logger.debug("addressDetails Found");
        response["addressDetails"] = digilockerDetails.data.addressDetails;
      }
      for (const element of digilockerDetails.data.documentDetails) {
        Logger.debug("Document details elements ", element);
        try {
          const docRequest = {
            headers: request.headers,
            doc_ids: [element.documentId],
          };
          const docServiceResponse =
            await this.documentService.addRegisterDocumentV2(
              docRequest.headers,
              docRequest.doc_ids
            );
          const doc = docServiceResponse?.data?.docs?.[0] ?? {};
          const { file_extension: fileExtension, access_id: accessId } = doc;
          const docUrl =
            `${process.env.DOC_SERVICE_URL}doc-service/v1/documents/` +
            accessId;
          const docType = mapDocType[element.documentType] ?? "document";
          response[docType] = docUrl;
          response[`${docType}Type`] = fileExtension;
        } catch (error) {
          Logger.error(
            "error while getting virtual doc id",
            JSON.stringify(error)
          );
        }
      }
      return response;
    } catch (error) {
      Logger.error("Error in fetch Kyc Service ", JSON.stringify(error));
      throw error;
    }
  }

  public async fetchRejectionRemarks(category_type: any): Promise<any> {
    const rejectionReason = await this.losService.fetchRejectionRemarks(
      category_type
    );
    return rejectionReason;
  }
  @UseCache({ expiryTimer: 600 })
  async getPkce(uuid: string) {
    const pkce = pkceChallenge();
    Logger.debug(
      `pkce for uuid ${uuid} -- codeChallenge ${pkce?.code_challenge} -- codeVerifier ${pkce?.code_verifier}`
    );
    return pkce;
  }

  public async leadReject(data: any) {
    const body = {
      leadId: data.MIS_SHEET[0].uuid,
      leadTrigger: "REJECT",
      data: {
        rejectionReason: data.MIS_SHEET[0].rejectionReason,
        rejectionRemarksId: data.MIS_SHEET[0].rejectionRemarksId,
      },
    };
    try {
      if (
        !(
          body.data.rejectionReason &&
          body.data.rejectionRemarksId &&
          body.leadId
        )
      ) {
        throw new HttpException(
          {
            message: validationErrors.REJECT_LEAD,
            body,
          },
          HttpStatus.BAD_REQUEST
        );
      }
      await this.losService.triggerLeadEvent(body);
      const modifiedData = {
        ...data.MIS_SHEET[0],
        status: "SUCCESS!!!",
      };
      return { data: modifiedData, status: "SUCCESS!!" };
    } catch (err) {
      const message =
        err?.response?.message || err.message || "some error ocurred!";
      return {
        message: message,
        data: { ...data.MIS_SHEET[0], status: message },
      };
    }
  }

  public async updateAndCreateLead(data: any) {
    const body = {
      leadId: data.MIS_SHEET[0].uuid,
      irdaReportingDate: data.MIS_SHEET[0].AppointmentDate,
      irdaId: data.MIS_SHEET[0].InternalPOSCode,
    };
    try {
      if (!(body.leadId && body.irdaReportingDate && body.irdaId)) {
        throw new Error(validationErrors.CREATE_IRDA_USER);
      }
      await this.updateLead(body.leadId, body);
      const reqBody = {
        leadId: body.leadId,
        leadTrigger: "CONVERT_LEAD",
        irda_id: body.irdaId,
        irda_reg_date: body.irdaReportingDate,
      };
      await this.losService.triggerLeadEvent(reqBody);
      return {
        message: "lead converted to user successfully",
        data: { ...body, status: "SUCCESS!!!" },
      };
    } catch (err) {
      const message =
        err?.response?.message || err.message || "some error ocurred!";
      return {
        message: message,
        data: { ...body, status: message },
      };
    }
  }

  public async fetchCkycDetailsV2(leadId, body): Promise<any> {
    const response = await this.losService.fetchLeadKYC(leadId, body);
    await this.updateLeadAdditionalDetails(leadId, body?.additionalDetails);
    const transformResponse = await this.transformLeadResponsev2(response.data);
    return transformResponse;
  }

  public async submitAadhaarOtp(leadId, body): Promise<any> {
    const response = await this.losService.submitAadhaarOtp(leadId, body);
    const transformResponse = await this.transformLeadResponsev2(response.data);
    return transformResponse;
  }

  private async transformLeadResponsev2(leadDetails) {
    const transformedResponse = {
      currentOnboardingStatus: "",
      currentOnboardingMsg: "",
      kycStatusMsg: "",
      currentOnboardingBtn: "",
      redirectionLink: "",
      leadId: leadDetails?.lead?.uuid,
      panDetails: {
        name: leadDetails.lead.name,
        pan_number: leadDetails.leadProfile.pan,
        date_of_birth: leadDetails.leadProfile.dateOfBirth,
        is_ckyc_fetched: false,
        is_verified: false,
        politically_exposed_consent: 1,
        pan: "",
        file_type: "",
        status: "invalid",
      },
      aadharDetails: {
        aadhar_number: "",
        pin_code: "",
        city_id: null,
        city_name: "",
        state_id: null,
        state_name: "",
        address: "",
        locality: null,
        af_doc_status: {
          doc_status: "invalid",
        },
        ab_doc_status: {
          doc_status: "invalid",
        },
        aadhar_front: "",
        aadhar_front_type: "",
        aadhar_back: "",
        aadhar_back_type: "",
        is_ckyc_fetched: false,
        is_verified: false,
        status: "invalid",
      },
    };
    const panDocument = leadDetails?.documents?.find(
      (doc) => doc.type === DocType.PAN
    );
    const aadhaarFrontDocument = leadDetails?.documents?.find(
      (doc) => doc.type === DocType.AADHAAR_FRONT
    );
    const aadhaarBackDocument = leadDetails?.documents?.find(
      (doc) => doc.type === DocType.AADHAAR_BACK
    );
    const homeAddress = leadDetails?.addresses?.find(
      (add) => add.type === AddType.HOME
    );

    if (panDocument) {
      transformedResponse.panDetails.is_ckyc_fetched = true;
      transformedResponse.panDetails.is_verified = true;
      if (panDocument.status !== DocStatus.REJECTED)
        transformedResponse.panDetails.status = "valid";
    }

    if (aadhaarFrontDocument && aadhaarBackDocument) {
      transformedResponse.aadharDetails.aadhar_number = "XXXX - XXXX - XXXX";
      transformedResponse.aadharDetails.is_ckyc_fetched = true;

      transformedResponse.aadharDetails.is_verified =
        aadhaarFrontDocument.source === DocStatus.AUTOMATED &&
        aadhaarBackDocument.source === DocStatus.AUTOMATED &&
        aadhaarFrontDocument.status !== DocStatus.REJECTED &&
        aadhaarBackDocument.status !== DocStatus.REJECTED;

      transformedResponse.aadharDetails.status = "valid";
      if (aadhaarFrontDocument?.status !== DocStatus.REJECTED)
        transformedResponse.aadharDetails.af_doc_status.doc_status = "valid";
      if (aadhaarBackDocument?.status !== DocStatus.REJECTED)
        transformedResponse.aadharDetails.ab_doc_status.doc_status = "valid";
    }
    if (homeAddress) {
      transformedResponse.aadharDetails.pin_code = homeAddress.pincode;
      transformedResponse.aadharDetails.city_id = homeAddress.cityId;
      transformedResponse.aadharDetails.state_id = homeAddress.stateId;
      transformedResponse.aadharDetails.address = homeAddress.address;
      transformedResponse.aadharDetails.locality = homeAddress.locality;
    } else {
      transformedResponse.aadharDetails.is_ckyc_fetched = false;
    }

    const {
      currentOnboardingStatus,
      kycStatusMsg,
      currentOnboardingBtn,
      currentOnboardingMsg,
      redirectionLink,
    } = this.getMessageAndButtonInfo(leadDetails?.lead);
    transformedResponse.currentOnboardingStatus = currentOnboardingStatus ?? "";
    transformedResponse.kycStatusMsg = kycStatusMsg ?? "";
    transformedResponse.currentOnboardingBtn = currentOnboardingBtn ?? "";
    transformedResponse.currentOnboardingMsg = currentOnboardingMsg ?? "";
    transformedResponse.redirectionLink = redirectionLink ?? "";

    const obj = {
      leadData: transformedResponse,
    };
    return obj;
  }

  public async updateLeadAdditionalDetails(leadId, leadAdditionalDetails) {
    if (leadAdditionalDetails && Object.keys(leadAdditionalDetails).length) {
      await this.losService.updateAdditionalDetails(
        leadId,
        createBodyForAdditionalDetailsUpdate(leadAdditionalDetails)
      );
    }
  }
}
