import { Injectable, Logger } from "@nestjs/common";
import CommonUtils from "../utils/common-utils";
import LeadUtils from "../utils/lead-utils";
import ApiHelper from "./helpers/common-api-helper";
import ApiPosService from "./apipos-service";
import MasterAPIService from "./master-service";
import LeadOnboardingService from "./leadonboarding-service";
import { Roles } from "../constants/roles.constants";
import { AddDetailsKeys, DocStatus, DocType } from "../constants/los.constants";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

const posSalesRoleIdList = Roles.POS_SALES_ALL;

@Injectable()
export default class RmFlowLeadOnboardingService {
  constructor(
    private masterService: MasterAPIService,
    private leadOnboardingService: LeadOnboardingService,
    private apiPosService: ApiPosService,
    private apiHelper: ApiHelper
  ) {}

  public async transformGetDetails(request: ReqWithUser, response: any) {
    const leadDocs = [];
    for (const doc of response.documents) {
      try {
        const docData = {
          docId: doc.documentId,
          docUrl: doc.url,
          status: doc.status,
          type: doc.type,
          source: doc.source,
          isReUploaded: doc.isReUploaded,
          remarkId: doc.remarkId,
          docType: "",
        };
        if (doc.documentId) {
          const { link, fileExtension } =
            await this.leadOnboardingService.fetchDocumentServiceLinkV2(
              request.headers,
              doc.documentId
            );
          docData.docUrl = link;
          docData.docType = fileExtension;
        }

        leadDocs.push(docData);
      } catch (error) {
        Logger.error("error while getting virtual doc id", error);
      }
    }
    const leadAddress = {};
    if (response?.addresses && response?.addresses.length) {
      for (const address of response?.addresses) {
        if (
          CommonUtils.isNumeric(address["locality"]) &&
          CommonUtils.isNumeric(address["pincode"])
        ) {
          const locality = await this.masterService.getLocality(
            address["locality"],
            address["pincode"]
          );
          address["locality"] = locality;
        }
        leadAddress[address.type] = address;
      }
    }
    const basicDetails = response.lead;
    const leadProfile = response?.leadProfile;
    const bankDetails = response?.bankDetails;
    const followupDetails = response?.followupDetails;
    const additionalDetails = response?.additionalDetails;
    let followupDetail = {};
    if (followupDetails != null && followupDetails.length > 0) {
      followupDetail = followupDetails.reduce((accumulator, currentValue) => {
        if (currentValue?.status === "CREATED") {
          return currentValue;
        }
      });
    }
    let examStatusLabel;
    if (response?.trainings && response?.trainings.length > 0) {
      if (request.query.insurance_type === "2") {
        const trainingMaterial = response.trainings.find(
          (x) => x.insuranceType === "LIFE"
        );
        if (trainingMaterial) {
          examStatusLabel = LeadUtils.getLeadExamStatusLabel(
            trainingMaterial?.status
          );
        }
      } else {
        const trainingMaterial = response.trainings.find(
          (x) => x.insuranceType === "GENERAL"
        );
        if (trainingMaterial) {
          examStatusLabel = LeadUtils.getLeadExamStatusLabel(
            trainingMaterial?.status
          );
        }
      }
    }
    const permissions = await this.addPermissions(response, request);
    const userInfo = request.userInfo;
    const agentDetails = userInfo?.agentDetails;
    if (agentDetails?.role_id === 2) {
      const data = [];
      const panEncrypted = leadProfile?.panEncrypted;
      if (panEncrypted) {
        data.push(panEncrypted);
        const decryptionOptions = {
          endpoint: process.env.DECRYPTION_SERVICE_V2_END_POINT,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.DECRYPTION_SERVICE_AUTH_TOKEN,
          },
        };
        const encryptedData = { data: data };
        const decryptionResponse = await this.apiHelper.postData(
          decryptionOptions,
          encryptedData
        );
        Logger.debug("Decryption Response", decryptionResponse);
        leadProfile["pan"] = decryptionResponse["data"][panEncrypted].decrypted;
      }
    }
    if (
      userInfo?.uuid === basicDetails?.assignedSalesUserId ||
      userInfo?.uuid === basicDetails?.referrerUserId
    ) {
      Logger.debug("decrypting pii fields ", userInfo?.uuid);
      const encryptedMobile = basicDetails.mobileEncrypted;
      const encryptedEmail = basicDetails?.emailEncrypted;
      const panEncrypted = leadProfile?.panEncrypted;
      const accountNumberEncrypted = bankDetails[0]?.accountNumberEncrypted;
      const data = [];
      if (encryptedEmail) {
        data.push(encryptedEmail);
      }
      if (encryptedMobile) {
        data.push(encryptedMobile);
      }
      if (panEncrypted) {
        data.push(panEncrypted);
      }
      if (accountNumberEncrypted) {
        data.push(accountNumberEncrypted);
      }
      if (data.length > 0) {
        const decryptionOptions = {
          endpoint: process.env.DECRYPTION_SERVICE_V2_END_POINT,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.DECRYPTION_SERVICE_AUTH_TOKEN,
          },
        };
        const encryptedData = { data: data };
        const decryptionResponse = await this.apiHelper.postData(
          decryptionOptions,
          encryptedData
        );
        Logger.debug("Decryption Response", decryptionResponse);
        if (decryptionResponse) {
          if (encryptedEmail) {
            basicDetails["email"] =
              decryptionResponse["data"][encryptedEmail].decrypted;
          }
          if (encryptedMobile) {
            basicDetails["mobile"] =
              decryptionResponse["data"][encryptedMobile].decrypted;
          }
          if (panEncrypted) {
            leadProfile["pan"] =
              decryptionResponse["data"][panEncrypted].decrypted;
          }
          if (accountNumberEncrypted) {
            bankDetails[0]["accountNumber"] =
              decryptionResponse["data"][accountNumberEncrypted].decrypted;
          }
        }
      }
    } else {
      CommonUtils.renameKey(basicDetails, "emailMasked", "email");
      CommonUtils.renameKey(basicDetails, "mobileMasked", "mobile");
      CommonUtils.renameKey(basicDetails, "pan", "pan");
      CommonUtils.renameKey(
        bankDetails[0],
        "accountNumberMasked",
        "accountNumber"
      );
    }
    let assignedUserDetails;
    try {
      if (basicDetails?.assignedSalesUserId) {
        assignedUserDetails = await this.apiPosService.fetchUserDetails(
          basicDetails.assignedSalesUserId,
          false
        );
      } else if (basicDetails?.referrerUserId) {
        assignedUserDetails = await this.apiPosService.fetchUserDetails(
          basicDetails.referrerUserId,
          false
        );
      }
    } catch (error) {
      Logger.error(`Error occurred in fetch assigned user details`, error);
    }
    const addDetailsMap = additionalDetails.reduce((acc, detail) => {
      acc[detail.name] = detail.value;
      return acc;
    }, {});

    const migrationDetails = {
      isReRegister: addDetailsMap[AddDetailsKeys.RE_REGISTER] === "1",
      isNocRequired: addDetailsMap[AddDetailsKeys.NOC_REQUIRED] === "1",
    };

    const isBeneficiaryNameVerified =
      addDetailsMap[AddDetailsKeys.BENE_NAME_VERIFIED] === "yes";
    const aadhaarName = addDetailsMap[AddDetailsKeys.AADHAAR_NAME];

    const aadhaarFrontDocument = leadDocs.find(
      (doc) => doc.type === DocType.AADHAAR_FRONT
    );
    const aadhaarBackDocument = leadDocs.find(
      (doc) => doc.type === DocType.AADHAAR_BACK
    );

    const isAadhaarVerified =
      aadhaarFrontDocument?.source === DocStatus.AUTOMATED &&
      aadhaarBackDocument?.source === DocStatus.AUTOMATED &&
      aadhaarFrontDocument?.status !== DocStatus.REJECTED &&
      aadhaarBackDocument?.status !== DocStatus.REJECTED;

    const transformedResponse = {
      status_label: LeadUtils.getLeadStatusLabel(basicDetails?.status),
      exam_status_label: examStatusLabel,
      user_assign_id: basicDetails?.assignedSalesUserId,
      leadStatus: basicDetails?.status,
      rejectionReason: basicDetails?.rejectionReason,
      is_edit_allowed: 1,
      send_for_reg: 1,
      action_status: 1,
      latitude: null,
      assigned_to: assignedUserDetails?.email || "",
      assigned_email: assignedUserDetails?.email || "",
      longitude: null,
      currentOnboardingStatus: "incomplete_leads",
      currentOnboardingMsg: "Complete KYC",
      kycStatusMsg: "KYC in process",
      leadId: response?.lead?.uuid,
      basicDetails: basicDetails,
      leadProfile: leadProfile,
      leadAddresses: leadAddress,
      migrationDetails: migrationDetails,
      followupDetails: followupDetail,
      bankDetails: {
        isActive: bankDetails[0]?.isActive,
        isBankVerified: bankDetails[0]?.isBankVerified,
        beneficiaryName: bankDetails[0]?.beneficiaryName,
        accountNumber: bankDetails[0]?.accountNumber,
        ifsc: bankDetails[0]?.ifsc,
        bankName: bankDetails[0]?.bankName,
        bankBranchName: bankDetails[0]?.bankBranchName,
        isJointAccount: bankDetails[0]?.isJointAccount,
        isBeneficiaryNameVerified: isBeneficiaryNameVerified,
      },
      panDetails: {
        pan_number: response?.leadProfile?.pan,
        date_of_birth: response?.leadProfile?.dateOfBirth,
        is_ckyc_fetched: true,
        status: "valid",
        //pan: docUrl,
      },
      aadharDetails: {
        aadhar_number: null,
        aadhaarName: aadhaarName,
        isVerified: isAadhaarVerified,
        pin_code: response?.addresses[0]?.pincode,
        city_id: response?.addresses[0]?.cityId,
        city_name: null,
        state_id: response?.addresses[0]?.cityId,
        state_name: null,
        address: response?.addresses[0]?.address,
        locality: null,
        af_doc_status: {
          doc_status: "valid",
        },
        ab_doc_status: {
          doc_status: "valid",
        },
        status: "valid",
      },
      leadDocs: leadDocs,
      permissions: permissions,
    };
    return transformedResponse;
  }

  private async addPermissions(leadDetails: any, request: ReqWithUser) {
    const userInfo = request.userInfo;
    const agentDetails = userInfo?.agentDetails;
    const response = {
      documents_upload_section: false,
      document_upload_mark_invalid_button: false,
      document_upload_edit_button: false,
      document_upload_re_upload_button: false,
      edit_button: false,
      assign_button: false,
      create_user_button: false,
      follow_up_button: false,
      close_button: false,
      reject_button: false,
      send_for_registration_button: false,
      send_study_material_button: false,
      download_study_material_button: false,
      share_test_link: false,
      take_test_button: false,
      reopen_button: false,
      re_register_button: false,
    };
    if (leadDetails?.lead?.status === "REGISTERED") {
      response.documents_upload_section = true;
      if (
        (Roles.POS_ADMIN_ALL.includes(agentDetails?.role_id) ||
          posSalesRoleIdList.includes(agentDetails?.role_id)) &&
        CommonUtils.isEmpty(leadDetails?.lead?.irdaId) &&
        leadDetails?.lead?.tenantId === 1
      ) {
        response.re_register_button = true;
      }
      return response;
    }
    if (leadDetails?.lead?.status === "CLOSED") {
      response.documents_upload_section = true;
      response.reopen_button =
        agentDetails?.role_id === 1 || agentDetails?.role_id === 2
          ? true
          : false;
      return response;
    }
    if (agentDetails?.role_id === 1 || agentDetails?.role_id === 2) {
      if (leadDetails?.lead?.tenantId === 1) {
        response.assign_button = true;
      }
      response.close_button = true;
      response.documents_upload_section = true;
      //response.document_upload_edit_button = true;
      //response.edit_button = true;
      if (leadDetails?.lead?.status === "CREATED") {
        response.document_upload_edit_button = true;
        response.edit_button = true;
        response.follow_up_button = true;
        response.send_for_registration_button = true;
      }
      if (leadDetails?.lead?.status === "REJECTED") {
        response.edit_button = true;
        response.send_for_registration_button = false;
        response.documents_upload_section = true;
        response.document_upload_edit_button = false;
      }
      if (
        leadDetails?.lead?.status === "REGISTRATION_REQUESTED" ||
        leadDetails?.lead?.status === "VERIFIED"
      ) {
        if (
          leadDetails?.lead?.status === "REGISTRATION_REQUESTED" &&
          (agentDetails?.role_id === 1 || agentDetails?.role_id === 2)
        ) {
          response.edit_button = true;
        }
        response.reject_button = true;
        if (
          typeof leadDetails?.bankDetails?.[0]?.isJointAccount === "boolean"
        ) {
          response.create_user_button = true;
        }
        if (request.query && request.query.insurance_type !== "2") {
          if (leadDetails?.trainings && !leadDetails?.trainings.length) {
            response.send_study_material_button = true;
          }
          if (leadDetails?.trainings && leadDetails?.trainings.length > 0) {
            if (request.query.insurance_type) {
              const trainingMaterial = leadDetails.trainings.find(
                (x) => x.insuranceType === "GENERAL"
              );
              if (trainingMaterial) {
                if (trainingMaterial.status === "TRAINING_MATERIAL_SHARED") {
                  response.download_study_material_button = true;
                }
                if (
                  trainingMaterial.status === "TRAINING_MATERIAL_DOWNLOADED"
                ) {
                  response.download_study_material_button = false;
                  const generalDownloadEvent = leadDetails?.timestamps.find(
                    (x) => x.event == "GENERAL_TRAINING_MATERIAL_DOWNLOADED"
                  );
                  if (generalDownloadEvent && generalDownloadEvent.timeStamp) {
                    const now: any = new Date();
                    const downloadDate: any = new Date(
                      generalDownloadEvent.timeStamp
                    );
                    const diff = (now - downloadDate) / 36e5;
                    if (diff > 48) {
                      response.share_test_link = true;
                    }
                  }
                }
                if (trainingMaterial.status === "TEST_LINK_SHARED") {
                  response.download_study_material_button = false;
                  response.share_test_link = false;
                  response.take_test_button = true;
                }
                if (trainingMaterial.status === "TEST_FAILED") {
                  if (leadDetails?.timestamps) {
                    const testFailTimestamp = leadDetails?.timestamps.find(
                      (x) => x.event === "GENERAL_TEST_FAILED"
                    );
                    if (testFailTimestamp) {
                      response.download_study_material_button = false;
                      response.take_test_button = true;
                    }
                  }
                }
              }
            }
          }
        } else {
          if (leadDetails?.trainings && !leadDetails?.trainings.length) {
            response.send_study_material_button = true;
          }
          if (leadDetails?.trainings && leadDetails?.trainings.length > 0) {
            const trainingMaterial = leadDetails.trainings.find(
              (x) => x.insuranceType === "LIFE"
            );
            if (trainingMaterial) {
              if (trainingMaterial.status === "TRAINING_MATERIAL_SHARED") {
                response.download_study_material_button = true;
              }
              if (trainingMaterial.status === "TRAINING_MATERIAL_DOWNLOADED") {
                response.download_study_material_button = false;
                const lifeDownloadEvent = leadDetails?.timestamps.find(
                  (x) => x.event == "LIFE_TRAINING_MATERIAL_DOWNLOADED"
                );
                if (lifeDownloadEvent && lifeDownloadEvent.timeStamp) {
                  const now: any = new Date();
                  const downloadDate: any = new Date(
                    lifeDownloadEvent.timeStamp
                  );
                  const diff = (now - downloadDate) / 36e5;
                  if (diff > 48) {
                    response.share_test_link = true;
                  }
                }
              }
              if (trainingMaterial.status === "TEST_LINK_SHARED") {
                response.download_study_material_button = false;
                response.share_test_link = false;
                response.take_test_button = true;
              }
              if (trainingMaterial.status === "TEST_FAILED") {
                if (leadDetails?.timestamps) {
                  const testFailTimestamp = leadDetails?.timestamps.find(
                    (x) => x.event === "LIFE_TEST_FAILED"
                  );
                  if (testFailTimestamp) {
                    response.download_study_material_button = false;
                    response.take_test_button = true;
                  }
                }
              }
            }
          }
        }
        response.documents_upload_section = true;
        if (leadDetails?.lead?.status === "REGISTRATION_REQUESTED") {
          response.document_upload_mark_invalid_button = true;
        }
      }
      if (leadDetails?.lead?.status === "DOCUMENTS_REUPLOAD_REQUIRED") {
        response.document_upload_mark_invalid_button = false;
        response.documents_upload_section = true;
        response.document_upload_re_upload_button = true;
        response.document_upload_edit_button = false;
      }
    } else if (
      posSalesRoleIdList.includes(agentDetails?.role_id) ||
      agentDetails?.role_id === 3
    ) {
      response.close_button = true;
      response.documents_upload_section = true;
      if (leadDetails?.lead?.status === "CREATED") {
        response.document_upload_edit_button = true;
        response.edit_button = true;
        response.follow_up_button = true;
        response.send_for_registration_button = true;
      }
      if (leadDetails?.lead?.status === "REJECTED") {
        response.edit_button = true;
        response.send_for_registration_button = false;
        response.document_upload_edit_button = false;
      }
      if (leadDetails?.lead?.status === "DOCUMENTS_REUPLOAD_REQUIRED") {
        response.document_upload_mark_invalid_button = false;
        response.document_upload_re_upload_button = true;
        response.document_upload_edit_button = false;
      }
    } /*else {
      throw new UnauthorizedException(401, "role not allowed for user");
    }*/
    return response;
  }
}
