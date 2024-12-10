import CommonApiHelper from "./helpers/common-api-helper";
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import ContextHelper from "./helpers/context-helper";
import MasterAPIService from "./master-service";
import { sendResponse } from "./helpers/response-handler";

import { config } from "../constants/config.constants";
import {
  LMWConstants,
  NON_MOTOR_POLICY_ACCESS_LOBS,
} from "../constants/lmw.constants";
import { Roles } from "../constants/roles.constants";
import MotorProposalService from "./motor-proposal.service";
import { LeadMiddlewareService } from "../core/api-helpers/lead-middleware.service";
import { HealthLeadMiddlewareService } from "./health-lmw.service";
import NonMotorLmwService from "./non-motor-lmw.service";
import CommonUtils from "../utils/common-utils";
import EncryptionService from "./encryption-service";
import KycService from "./kyc-service";

@Injectable()
export default class LeadAddService {
  constructor(
    private apiHelper: CommonApiHelper,
    private masterApiService: MasterAPIService,
    private motorProposalService: MotorProposalService,
    private leadMiddlewareService: LeadMiddlewareService,
    private healthLeadMiddlewareService: HealthLeadMiddlewareService,
    private nonMotorLmwService: NonMotorLmwService,
    private encryptionService: EncryptionService,
    private kycService: KycService
  ) {}

  public async addData(request: any): Promise<any> {
    try {
      let response: any = {};
      let medium = "";
      if (
        request.headers["x-forwarded-host"] == process.env.X_FORWAREDED_POS_HOST
      ) {
        medium = process.env.POS_MEDIUM;
      } else {
        medium = process.env.APP_MEDIUM;
      }
      let prodType = "travel";
      if (request.params.id == "pet-add-pos-lead") {
        prodType = "pet";
      }
      if (request.params.id == "wellness-add-pos-lead") {
        prodType = "wellness";
      }
      if (request.params.id == "hospicash-add-pos-lead") {
        prodType = "hospicash";
      }

      const options = {
        endpoint:
          process.env.LMW_URL +
          `non-motor-lmw/${prodType}/v1/leads?medium=${medium}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-correlation-id": ContextHelper.getStore().get("x-correlation-id"),
          "x-api-key": process.env.TRAVEL_X_API_KEY,
        },
      };
      const data = request.body;
      let leadData;
      if (request.params.id == "pet-add-pos-lead") {
        leadData = await this.preparePetData(data);
      } else if (request.params.id == "travel-add-pos-lead") {
        leadData = await this.prepareTravelData(data);
      } else if (request.params.id == "wellness-add-pos-lead") {
        leadData = await this.prepareWellnessData(data);
      } else if (request.params.id == "hospicash-add-pos-lead") {
        leadData = await this.prepareHospicashData(data, medium);
      }
      const encryptionOptions = {
        endpoint: process.env.ENCRYPTION_SERVICE_ENDPOINT,
        method: "POST",
      };
      if (
        leadData &&
        leadData.proposerDetails &&
        leadData.proposerDetails.mobile
      ) {
        const data = { data: [leadData.proposerDetails.mobile] };
        const encryptionResponse = await this.apiHelper.postData(
          encryptionOptions,
          data
        );
        if (encryptionResponse && encryptionResponse.data) {
          leadData["maskedMobile"] = encryptionResponse.data[0].masked;
          leadData.proposerDetails.mobile = encryptionResponse.data[0].ecrypted;
        } else {
          return sendResponse(
            request,
            response,
            503,
            "Mobile not decrypted Successfully",
            encryptionResponse
          );
        }
      }
      leadData["businessType"] = "new";
      Logger.debug("created lead with following request", leadData);
      response = await this.apiHelper.postData(options, leadData);
      return response;
    } catch (error) {
      throw new HttpException(
        "Some error has occured while posting the data.",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  private async preparePetData(data: any): Promise<any> {
    const isPed =
      data && data.pedSwitch ? (data.pedSwitch == "yes" ? 0 : 1) : 1;
    const name = data && data.ownerName ? data.ownerName : "";
    const mobile = data && data.mobile ? data.mobile : "";
    const leadData = {
      source: data && data.source ? data.source : "",
      subSource: data && data.subSource ? data.subSource : "",
      medium: data && data.medium ? data.medium : "",
      isPed: isPed ? isPed : 0,
      productType: data && data.productType ? data.productType : "",
      policyMode: "online",
      creatorIamId: data && data.creatorIamId ? data.creatorIamId : "",
      creatorType: data?.creatorType || "",
      channelIamId:
        data &&
        data.dealerSingleSelect &&
        data.dealerSingleSelect[0] &&
        data.dealerSingleSelect[0].value
          ? data.dealerSingleSelect[0].value
          : data && data.creatorIamId
          ? data.creatorIamId
          : "",
    };
    const proposerData = {
      firstName: name.split(" ").slice(0, 1).join(" "),
      lastName: name.split(" ").slice(1).join(" "),
      mobile: mobile,
    };
    leadData["proposerDetails"] = proposerData;
    const insuredMembers = [];
    const insData = {
      breedId:
        data &&
        data.breedsSingleSelect &&
        data.breedsSingleSelect[0] &&
        data.breedsSingleSelect[0].value
          ? parseInt(data.breedsSingleSelect[0].value)
          : null,
      ageMonths: data && data.petMonth ? parseInt(data.petMonth) : null,
      ageYears: data && data.petYear ? parseInt(data.petYear) : null,
    };
    insuredMembers.push(insData);
    leadData["insuredMembers"] = insuredMembers;

    return leadData;
  }
  private async prepareTravelData(data: any): Promise<any> {
    const isPed =
      data && data.pedSwitch ? (data.pedSwitch == "yes" ? 1 : 0) : 0;
    const name = data && data.ownerName ? data.ownerName : "";
    const mobile = data && data.mobile ? data.mobile : "";
    const leadData = {
      source: data && data.source ? data.source : "",
      subSource: data && data.subSource ? data.subSource : "",
      medium: data && data.medium ? data.medium : "",
      isPed: isPed ? isPed : 0,
      productType: data && data.productType ? data.productType : "",
      policyMode: "online",
      creatorIamId: data && data.creatorIamId ? data.creatorIamId : "",
      channelIamId:
        data &&
        data.dealerSingleSelect &&
        data.dealerSingleSelect[0] &&
        data.dealerSingleSelect[0].value
          ? data.dealerSingleSelect[0].value
          : data && data.creatorIamId
          ? data.creatorIamId
          : "",
      creatorType: data?.creatorType || "",
      startDate: moment(data.startDate).format("YYYY-MM-DD"),
      endDate: moment(data.endDate).format("YYYY-MM-DD"),
    };
    const proposerData = {
      currency: "dollar",
      firstName: name.split(" ").slice(0, -1).join(" "),
      lastName: name.split(" ").slice(-1).join(" "),
      mobile: mobile,
    };
    leadData["proposerDetails"] = proposerData;
    const destinations = data.countriesMultiSelect.map((item) => {
      return item.value;
    });
    const productData = {
      tripType: data && data.tripType ? data.tripType : "",
      destinations: destinations ? destinations : [],
    };
    leadData["productDetails"] = productData;

    let insuredMembers = [];
    if (data.tripType == "single") {
      data.travellersMultiSelect.forEach((item) => {
        if (item.value == 1) {
          insuredMembers.push({
            dob: data.selfAge,
            age: this.getAgeFromDate(data.selfAge, data.startDate),
            relation: "self",
          });
        }
        if (item.value == 2) {
          insuredMembers.push({
            dob: data.spouseAge,
            age: this.getAgeFromDate(data.spouseAge, data.startDate),
            relation: "spouse",
          });
        }
        if (item.value == 6) {
          insuredMembers.push({
            dob: data.fatherAge,
            age: this.getAgeFromDate(data.fatherAge, data.startDate),
            relation: "father",
          });
        }
        if (item.value == 5) {
          insuredMembers.push({
            dob: data.motherAge,
            age: this.getAgeFromDate(data.motherAge, data.startDate),
            relation: "mother",
          });
        }
        if (item.value == 3) {
          for (let i = 0; i < data.sonCheckBox; i++) {
            insuredMembers.push({
              dob: data[`son${i + 1}Age`],
              age:
                this.getAgeFromDate(data[`son${i + 1}Age`], data.startDate) ||
                1,
              relation: "son",
            });
          }
        }
        if (item.value == 4) {
          for (let i = 0; i < data.daughterCheckBox; i++) {
            insuredMembers.push({
              dob: data[`daughter${i + 1}Age`],
              age:
                this.getAgeFromDate(
                  data[`daughter${i + 1}Age`],
                  data.startDate
                ) || 1,
              relation: "daughter",
            });
          }
        }
      });
    } else {
      if (data.studentAge) {
        insuredMembers.push({
          dob: data.studentAge,
          age: this.getAgeFromDate(data.studentAge, data.startDate),
          relation: "self",
        });
      }
    }
    const order = ["self", "spouse", "father", "mother"];
    const sortedList = {};
    order.forEach((relation, index) => {
      sortedList[relation] = index;
    });
    insuredMembers = insuredMembers.sort((first, second) => {
      const orderA = sortedList[first.relation] ?? order.length;
      const orderB = sortedList[second.relation] ?? order.length;
      return orderA - orderB;
    });
    leadData["insuredMembers"] = insuredMembers;
    return leadData;
  }

  private async prepareHospicashData(data: any, medium: any): Promise<any> {
    const leadData = {
      source: data && data.source ? data.source : "",
      subSource: data && data.subSource ? data.subSource : medium,
      medium: data && data.medium ? data.medium : medium,
      isPed: data.isPed ? data.isPed : 0,
      productType: data && data.productType ? data.productType : "",
      policyMode: "online",
      creatorIamId: data && data.creatorIamId ? data.creatorIamId : "",
      channelIamId:
        data && data.channelIamId
          ? data.channelIamId
          : data && data.creatorIamId
          ? data.creatorIamId
          : "",
      creatorType: data?.creatorType || "",
    };
    const insuredMembers = data?.insuredMembers || [];
    leadData["insuredMembers"] = insuredMembers;
    const { CustomerName } = data?.proposerDetails || {};
    let firstName = "";
    let lastName = "";

    if (CustomerName) {
      const nameParts = CustomerName.split(" ");
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
    }

    const proposerData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobile: data?.proposerDetails?.mobile || "",
    };

    leadData["proposerDetails"] = proposerData;
    const insuredType = data?.insuredType || "";

    leadData["insuredType"] = insuredType || "";
    leadData["businessType"] = "new";
    leadData["productDetails"] = { insuredType };

    return leadData;
  }

  private async prepareWellnessData(data: any): Promise<any> {
    const name = data?.customerName ? data.customerName : "";
    const leadData = {
      source: data?.source ? data.source : "",
      subSource: data?.subSource ? data.subSource : "",
      medium: data?.medium ? data.medium : "",
      productType: data?.productType ? data.productType : "",
      policyMode: "online",
      startDate: data?.startDate ? data.startDate : "",
      endDate: data?.endDate ? data.endDate : "",
      channelIamId: data?.channelIamId ? data.channelIamId : "",
      creatorIamId: data?.creatorIamId ? data.creatorIamId : "",
      planType: data.planType ? data.planType : "OPD",
    };
    const proposerData = {
      firstName: name.split(" ").slice(0, 1).join(" "),
      lastName: name.split(" ").slice(1).join(" "),
    };
    const productData = {
      pincode: data?.pincode ? data.pincode : "",
      insuredType: data?.insuredType ? data?.insuredType : "",
    };

    leadData["proposerDetails"] = proposerData;
    leadData["productDetails"] = productData;

    if (data?.insuredMembers?.length > 0) {
      leadData["insuredMembers"] = data.insuredMembers;
    } else {
      leadData["insuredMembers"] = [];
    }
    return leadData;
  }

  public getAgeFromDate(dateString, relativeDate) {
    const today = new Date(relativeDate);
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  public async addLeadData(request: any): Promise<any> {
    let response: any = {};
    let medium = "";
    if (
      request.headers["x-forwarded-host"] == process.env.X_FORWAREDED_POS_HOST
    ) {
      medium = process.env.POS_MEDIUM;
    } else {
      medium = process.env.APP_MEDIUM;
    }
    const options = {
      endpoint:
        process.env.LMW_URL +
        `non-motor-lmw/${request.params.id}/v1/leads?medium=${medium}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id":
          request && request.headers && request.headers["x-correlation-id"]
            ? request.headers["x-correlation-id"]
            : "12345",
        "x-api-key":
          request && request.headers && request.headers["x-api-key"]
            ? request.headers["x-api-key"]
            : process.env.TRAVEL_X_API_KEY,
      },
    };
    const encryptionOptions = {
      endpoint: process.env.ENCRYPTION_SERVICE_ENDPOINT,
      method: "POST",
    };
    if (
      request.body &&
      request.body.proposerDetails &&
      request.body.proposerDetails.mobile
    ) {
      const data = { data: [request.body.proposerDetails.mobile] };
      const encryptionResponse = await this.apiHelper.postData(
        encryptionOptions,
        data
      );
      if (encryptionResponse && encryptionResponse.data) {
        request.body["maskedMobile"] = encryptionResponse.data[0].masked;
        request.body.proposerDetails.mobile =
          encryptionResponse.data[0].ecrypted;
      } else {
        return sendResponse(
          request,
          response,
          503,
          "Mobile not decrypted Successfully",
          encryptionResponse
        );
      }
    }
    if (
      request.body &&
      request.body.proposerDetails &&
      request.body.proposerDetails.email
    ) {
      const data = { data: [request.body.proposerDetails.email] };
      const encryptionResponse = await this.apiHelper.postData(
        encryptionOptions,
        data
      );
      if (encryptionResponse && encryptionResponse.data) {
        request.body["maskedEmail"] = encryptionResponse.data[0].masked;
        request.body.proposerDetails.email =
          encryptionResponse.data[0].ecrypted;
      } else {
        return sendResponse(
          request,
          response,
          503,
          "Mobile not decrypted Successfully",
          encryptionResponse
        );
      }
    }
    response = await this.apiHelper.postData(options, request.body);
    return response;
  }

  public async updateLeadData(request: any): Promise<any> {
    let response: any = {};
    let medium = "";
    if (
      request.headers["x-forwarded-host"] == process.env.X_FORWAREDED_POS_HOST
    ) {
      medium = process.env.POS_MEDIUM;
    } else {
      medium = process.env.APP_MEDIUM;
    }
    const options = {
      endpoint:
        process.env.LMW_URL +
        `non-motor-lmw/${request.params.id}/v1/leads?medium=${medium}`,
      config: {
        headers: {
          "x-correlation-id":
            request && request.headers && request.headers["x-correlation-id"]
              ? request.headers["x-correlation-id"]
              : "12345",
          "x-api-key":
            request && request.headers && request.headers["x-api-key"]
              ? request.headers["x-api-key"]
              : process.env.TRAVEL_X_API_KEY,
        },
        timeout: 100000,
      },
    };

    request.body["businessType"] = "new";
    const encryptionOptions = {
      endpoint: process.env.ENCRYPTION_SERVICE_ENDPOINT,
      method: "POST",
    };
    const encryptedData: any = { data: [] };

    if (
      request?.body?.proposerDetails?.email &&
      CommonUtils.isValidEmail(request?.body?.proposerDetails?.email)
    ) {
      encryptedData.data.push(request.body.proposerDetails.email);
    }

    if (request?.body?.proposerDetails?.mobile) {
      encryptedData.data.push(request?.body?.proposerDetails?.mobile);
    }
    if (request?.body && request?.body?.insuredMembers) {
      const insuredMembers = request.body.insuredMembers;
      for (const i in insuredMembers) {
        if (insuredMembers[i].passportNo) {
          encryptedData.data.push(insuredMembers[i]?.passportNo);
        }
        if (insuredMembers[i].sponsor) {
          encryptedData.data.push(insuredMembers[i]?.sponsor.mobile);
        }
      }
    }

    if (request?.body?.proposerDetails?.panNumber) {
      encryptedData.data.push(request?.body?.proposerDetails?.panNumber);
    }
    if (request?.body?.proposerDetails?.aadharNo) {
      encryptedData.data.push(request?.body?.proposerDetails?.aadharNo);
    }

    if (encryptedData.data.length > 0) {
      const encryptionResponse = await this.apiHelper.postData(
        encryptionOptions,
        { data: encryptedData.data }
      );
      if (encryptionResponse?.data) {
        if (
          request?.body?.proposerDetails?.email &&
          CommonUtils.isValidEmail(request?.body?.proposerDetails?.email)
        ) {
          const email = encryptionResponse.data.find(
            (item) => item.data === request.body.proposerDetails.email
          );
          request.body["maskedEmail"] = email?.masked;
          request.body.proposerDetails.email = email?.ecrypted;
        }

        if (request?.body?.proposerDetails?.mobile) {
          const mobile = encryptionResponse.data.find(
            (item) => item.data === request.body.proposerDetails.mobile
          );
          request.body["maskedMobile"] = mobile?.masked;
          request.body.proposerDetails.mobile = mobile?.ecrypted;
        }
        if (request?.body?.insuredMembers) {
          const insuredMembers = request.body.insuredMembers;
          for (const i in insuredMembers) {
            if (insuredMembers[i]?.passportNo) {
              const passport = encryptionResponse.data.find(
                (item) => item.data === insuredMembers[i].passportNo
              );
              request.body.insuredMembers[i]["maskedPassportNo"] =
                passport?.masked;
              request.body.insuredMembers[i]["passportNo"] = passport?.ecrypted;
            }
            if (insuredMembers[i].sponsor?.mobile) {
              const sponsorMobile = encryptionResponse.data.find(
                (item) => item.data === insuredMembers[i].sponsor.mobile
              );
              request.body.insuredMembers[i]["sponsor"]["maskedMobile"] =
                sponsorMobile?.masked;
              request.body.insuredMembers[i]["sponsor"]["mobile"] =
                sponsorMobile?.ecrypted;
            }
          }
        }

        if (request?.body?.proposerDetails?.panNumber) {
          const panNumber = encryptionResponse.data.find(
            (item) => item.data === request?.body?.proposerDetails?.panNumber
          );
          request.body["maskedPanNumber"] = panNumber?.masked;
          request.body.proposerDetails.panNumber = panNumber?.ecrypted;
        }
        if (request?.body?.proposerDetails?.aadharNo) {
          const aadharNumber = encryptionResponse.data.find(
            (item) => item.data === request?.body?.proposerDetails?.aadharNo
          );
          request.body["maskedaadharNo"] = aadharNumber?.masked;
          request.body.proposerDetails.aadharNo = aadharNumber?.ecrypted;
        }
      }
    }
    response = await this.apiHelper.putData(options, request.body);

    // Handling for : Never return Payment URL via Update Lead call for Products supporting OTP flow
    if (
      LMWConstants.OTP_NON_MOTOR_PRODUCT_TYPES.includes(request.params.id) &&
      !LMWConstants.PAYMENT_LINK_FROM_UPDATE_LEAD_PRODUCTS.includes(
        request.params.id
      ) &&
      response?.data?.paymentUrl
    ) {
      response.data.paymentUrl = "";
    }

    return response;
  }

  public async uploadDoc(request, file: any): Promise<any> {
    let response = {};
    const options = {
      endpoint: process.env.DOC_SERVICE_URL + `doc-service/v1/documents`,
      method: "POST",
      config: {
        maxContentLength: 100000000,
        maxBodyLength: 1000000000,
        headers: {
          Authorization:
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwOlwvXC9pYW0uaW5zdXJhbmNlZGVraG8ubG9jYWwiLCJhdWQiOiJodHRwOlwvXC9pYW0uaW5zdXJhbmNlZGVraG8ubG9jYWwiLCJpYXQiOjE2Mzg0MTU5ODksIm5iZiI6MTYzODQxNTk4OSwiZXhwIjoxNjQxMDA3OTg5LCJkYXRhIjp7InJvbGVzIjpbXSwidXVpZCI6ImY1YTJjMjIwLWNmOGEtNGYzYi1hNTg5LTllNWNhYjIyN2RiYiIsImVtYWlsIjpudWxsLCJtb2JpbGUiOiI5OTk5NDY3NDg4In19.mFT35TrlOngJdIu-JU1iZXMZofV9gWYXg8oL0ZSSLqNtblDB2Um41oJ02FaIWInyXFwFjoaPxKjwZ_HOg8ly3A",
          "x-api-key": process.env.DOC_SERVICE_API_KEY,
        },
      },
    };
    file.originalname = uuidv4() + "_" + file.originalname;
    const data = { document: file, doc_owner_uuid: "owner" };
    response = await this.apiHelper.postData(options, data);
    return response;
  }
  public async addRegisterDocument(request: any): Promise<any> {
    let response = {};
    const options = {
      endpoint:
        process.env.DOC_SERVICE_URL + `doc-service/v1/documents/register`,
      method: "POST",
      config: {
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers["authorization"],
          "x-api-key": process.env.DOC_SERVICE_API_KEY,
        },
      },
    };
    response = await this.apiHelper.postData(options, request.body);
    return response;
  }

  public async addOrUpdateHealthLead(data: any): Promise<any> {
    try {
      let visit = {};
      const message = "Lead Accepted";

      const options = {
        endpoint: process.env.API_LMW_HEALTH_URL + `/health/leads/create`,
      };
      if (data["pincode"]) {
        const areaDetailsByPinCode =
          await this.masterApiService.getAreaDetailsByPinCode(data["pincode"]);
        data.state_name = areaDetailsByPinCode[0].stateName;
      }
      if (data["step"] == 3) {
        delete data.lead_id;
        const leadData = await this.setHealthLeadDetailsData(data);
        const { fatherMotherData, childData, spouseData, selfData } =
          await this.setHealthLeadQuoteData(data);

        leadData.quote_data = {
          ...fatherMotherData,
          ...childData,
          ...spouseData,
          ...selfData,
        };
        leadData.source = data.source;
        leadData.first_step_lead = data["first_step_lead"]
          ? data["first_step_lead"]
          : "";

        visit = await this.apiHelper.postData(options, leadData);
      }
      const response = {
        sent: true,
        status: true,
        visit_id: visit?.["result"]?.["visit_id"]
          ? visit["result"]["visit_id"]
          : "",
        pincode: data.pincode ? data.pincode : "",
        message: message,
        lead_id: config.DUMMY_LEAD_ID,
      };
      return response;
    } catch (error) {
      throw new HttpException(
        "Some error has occured while posting the data.",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
  public async setHealthLeadDetailsData(params: any): Promise<any> {
    const detailsData = {};
    if (params["source"]) {
      detailsData["source"] = params["source"];
    }
    if (params["sub_source"]) {
      detailsData["sub_source"] = params["sub_source"];
    }
    if (params["medium"]) {
      detailsData["medium"] = params["medium"];
    }
    detailsData["qrCode"] =
      params["utm_campaign"] && params["utm_medium"].toLowerCase() === "saathi"
        ? params["utm_campaign"]
        : "";

    detailsData["details"] = {
      health_first_name: params["customer_name"],
      health_mobile_no: params["mobile_number"],
      city_name: params["city_name"],
      city_id: params["city_id"] ? params["city_id"] : "",
      state_name: params["state_name"] ? params["state_name"] : "",
      health_sum_insured: params["sum_insured"]
        ? params["sum_insured"]
        : 500000,
      pincode: params["pincode"] ? params["pincode"] : "",
      gender: params["gender_primary"] ? params["gender_primary"] : "",
      plan_type: params["plan_type"] ? params["plan_type"] : "base",
    };

    (detailsData["details"]["existing_disease"] = params["existing_disease"]
      ? params["existing_disease"]
      : ""),
      (detailsData["dealer_id"] = params["dealer_id"]
        ? params["dealer_id"]
        : 0);
    detailsData["agent_id"] = params["agent_id"] ? params["agent_id"] : 0;
    detailsData["account_uuid"] = params["account_uuid"]
      ? params["account_uuid"]
      : "";

    if (params["creatorIamId"]) {
      detailsData["creatorIamId"] = params["creatorIamId"];
    }
    if (params["creatorType"]) {
      detailsData["creatorType"] = params["creatorType"];
    }
    detailsData["visit_id"] = params["visit_id"] ? params["visit_id"] : "";
    detailsData["step"] = params["step"] ? params["step"] : "";
    detailsData["isEditFormShown"] = params["isEditFormShown"]
      ? params["isEditFormShown"]
      : "";

    return detailsData;
  }

  public async setHealthLeadQuoteData(params: any): Promise<any> {
    let fatherMotherData = {};
    let childData = {};
    let spouseData = {};
    let selfData = {};

    if (
      (params.self_relation || params.spouse_relation) &&
      ((params.self_relation &&
        ["mother", "father"].indexOf(params.self_relation) > -1) ||
        (params.spouse_relation &&
          ["mother", "father"].indexOf(params.spouse_relation) > -1))
    ) {
      fatherMotherData = await this.setFatherMotherData(params);
    } else {
      selfData = await this.setSelfData(params);
      spouseData = await this.setSpouseData(params);
      childData = await this.setChildData(params);
      if (!childData["child"]) {
        childData["child"] = 0;
        childData["child_data"] = [];
      }
    }
    return {
      fatherMotherData,
      childData,
      spouseData,
      selfData,
    };
  }
  public async setSelfData(params: any): Promise<any> {
    const selfData = {};
    if (params["age"]) {
      selfData["self"] = 1;
      selfData["self_age"] = params["age"];
      selfData["self_gender"] = params["gender_primary"];
    }
    return selfData;
  }

  public async setSpouseData(params: any): Promise<any> {
    const spouseData = {};
    if (params["spouse"] == "Yes") {
      spouseData["spouse"] = 1;
      spouseData["spouse_gender"] = params["spouse_gender"];
      spouseData["spouse_age"] = params["spouse_age"];
    }
    return spouseData;
  }

  public async setFatherMotherData(params: any): Promise<any> {
    const fatherMotherData = {};
    if (
      (params["self_relation"] &&
        params["self_relation"].toLowerCase() == "father") ||
      (params["spouse_relation"] &&
        params["spouse_relation"].toLowerCase() == "father")
    ) {
      fatherMotherData["father_age"] =
        params["self_relation"].toLowerCase() == "father"
          ? params["age"]
          : params["spouse_age"];
    }
    if (
      (params["self_relation"] && params["self_relation"] == "mother") ||
      (params["spouse_relation"] && params["spouse_relation"] == "mother")
    ) {
      fatherMotherData["mother_age"] =
        params["self_relation"].toLowerCase() == "mother"
          ? params["age"]
          : params["spouse_age"];
    }
    return fatherMotherData;
  }
  setChildData(params) {
    const childData = {};
    if (params["child_count"]) {
      childData["child"] = params["child_count"];
      childData["child_data"] = [];
      for (let i = 0; i < params["childs"].length; i++) {
        childData["child_data"].push([
          params["childs"][i]["gender"],
          parseInt(params["childs"][i]["age"]),
        ]);
      }
    }
    return childData;
  }
  public async addPersonalAccidentLead(body: any): Promise<any> {
    try {
      let visit = {};
      const message = "Lead Accepted";
      // const status = true;

      const options = {
        endpoint: process.env.API_LMW_HEALTH_URL + `/health/leads/create`,
      };
      const leadData = this.leadMapperPA(body);
      visit = await this.apiHelper.postData(options, leadData);
      Logger.debug("visit", visit);
      const response = {
        sent: true,
        status: true,
        visit_id: visit?.["result"]?.["visit_id"]
          ? visit["result"]["visit_id"]
          : "",
        pincode: body.pincode ? body.pincode : "",
        message: message,
        lead_id: config.DUMMY_LEAD_ID,
      };

      return response;
    } catch (err) {
      Logger.error("Error in Add Personal lead Service", err);
    }
  }
  leadMapperPA(obj) {
    const details = {
      health_first_name: obj.name ?? "",
      health_mobile_no: obj.mobile ?? "",
      pincode: obj?.pincode ?? 0,
      city_name: obj.city_name ?? "",
      city_id: obj?.city_id ?? "",
      state_name: obj?.state_name ?? "",
      health_sum_insured: obj?.health_sum_insured ?? 1000000,
      health_sum_insured_title: obj?.health_sum_insured_title ?? "10 Lac",
      gender: obj?.gender ?? "Male",
      plan_type: "personal_accident",
      policy_mode: "new",
    };
    const quote_data = {
      child: 0,
      child_data: [],
    };
    const childArr = [];
    obj.familyMembers.forEach((member) => {
      if (member.label === "son" || member.label === "daughter") {
        quote_data.child += obj[`${member.label}Count`];
        for (let i = 1; i <= obj[`${member.label}Count`]; i++) {
          childArr.push([
            obj[`${member.label}${i}_gender`],
            parseInt(obj[`${member.label}${i}_age`]),
            0,
          ]);
        }
      } else {
        quote_data[member.label] = 1;
        quote_data[`${member.label}_age`] =
          parseInt(obj[`${member.label}_age`]) ?? 0;
        quote_data[`${member.label}_gender`] =
          obj[`${member.label}_gender`] ?? "Male";
        quote_data[`${member.label}_annual_income`] =
          obj[`${member.label}_annual_income`] ?? "500000";
      }
    });
    if (childArr.length > 0) {
      quote_data["child_data"] = childArr;
    }

    const data = {
      source: obj.source,
      creatorType: obj.creatorType,
      sub_source: obj.sub_source,
      medium: obj.medium,
      details: details,
      quote_data: quote_data,
      agent_id: 98353322,
      dealer_id: obj.dealer_id,
      dealer_name: obj.dealer_name,
      dealer_city: obj.dealer_city,
      parent_id: false,
      creatorIamId: obj.creatorIamId,
      city_name: obj.city_name,
      state_id: obj.state_id,
    };
    return data;
  }

  public async updateHealthVisit(data: any): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_LMW_HEALTH_URL + `/health/leads/update-visit`,
      };
      const response = await this.apiHelper.postData(options, data);
      return response;
    } catch (error) {
      throw new HttpException(error?.status || 500, error);
    }
  }
  public async saveProposalDetails(data: any): Promise<any> {
    try {
      const options = {
        endpoint:
          process.env.API_LMW_HEALTH_URL +
          `/health/proposal/save-proposal-details`,
      };
      const response = await this.apiHelper.postData(options, data);
      return response;
    } catch (error) {
      throw new HttpException(error?.status || 500, error);
    }
  }
  public async saveMedicalDetails(data: any): Promise<any> {
    try {
      const options = {
        endpoint:
          process.env.API_LMW_HEALTH_URL +
          `/health/medical/save-medical-details`,
      };
      const response = await this.apiHelper.postData(options, data);
      return response;
    } catch (error) {
      throw new HttpException(error?.status || 500, error);
    }
  }

  public async saveSelectedQuote(data: any): Promise<any> {
    const options = {
      endpoint:
        process.env.API_QMW_HEALTH_URL + `/health/quotes/selected-quote`,
    };
    const response = await this.apiHelper.postData(options, data);

    return response;

    // throw new HttpException(
    //   { message: response?.message, errors: response.errors },
    //   response.status || 500
    // );
  }

  public prepareDataForEncryption(request: any, data: any) {
    const encryptedData: any = { data: [] };
    if (data?.data?.proposerDetails?.email) {
      encryptedData.data.push(data.data.proposerDetails.email);
    }

    if (data?.data?.proposerDetails?.panNumber) {
      encryptedData.data.push(data.data.proposerDetails.panNumber);
    }
    if (data?.data?.proposerDetails?.aadharNumber) {
      encryptedData.data.push(data.data.proposerDetails.aadharNumber);
    }

    if (data?.data?.proposerDetails?.mobile) {
      encryptedData.data.push(data.data.proposerDetails.mobile);
    }
    if (data?.data?.insuredMembers) {
      const insuredMembers = data.data.insuredMembers;
      for (const i in insuredMembers) {
        if (insuredMembers[i].passportNo) {
          encryptedData.data.push(insuredMembers[i]?.passportNo);
        }
        if (insuredMembers[i].sponsor?.mobile) {
          encryptedData.data.push(insuredMembers[i]?.sponsor.mobile);
        }
      }
    }

    return encryptedData.data;
  }

  public async processEncryptionResponse(data: any, encryptionResponse: any) {
    if (data?.data?.proposerDetails?.email) {
      data.data.proposerDetails.email =
        encryptionResponse.data[data.data.proposerDetails.email].decrypted;
    }

    if (data?.data?.proposerDetails?.panNumber) {
      data.data.proposerDetails.panNumber =
        encryptionResponse.data[data.data.proposerDetails.panNumber].decrypted;
    }
    if (data?.data?.proposerDetails?.aadharNumber) {
      data.data.proposerDetails.aadharNumber =
        encryptionResponse.data[
          data.data.proposerDetails.aadharNumber
        ].decrypted;
    }

    if (data?.data?.proposerDetails?.mobile) {
      data.data.proposerDetails.mobile =
        encryptionResponse.data[data.data.proposerDetails.mobile].decrypted;
    }
    if (data?.data?.insuredMembers) {
      const insuredMembers = data.data.insuredMembers;
      for (const i in insuredMembers) {
        if (insuredMembers[i]?.passportNo) {
          data.data.insuredMembers[i].passportNo =
            encryptionResponse?.data[insuredMembers[i]?.passportNo]?.decrypted;
        }
        if (insuredMembers[i].sponsor?.mobile) {
          data.data.insuredMembers[i].sponsor.mobile =
            encryptionResponse?.data[
              insuredMembers[i]?.sponsor.mobile
            ]?.decrypted;
        }
      }
    }
  }

  public checkPolicyDocAccess(leadDetails: any, userInfo: any): Promise<any> {
    const updatedLeadDetails = { ...leadDetails };
    const authorization = ContextHelper.getStore().get("authorization");

    if (
      NON_MOTOR_POLICY_ACCESS_LOBS.includes(leadDetails?.data?.productType) &&
      (!authorization || Roles.POS_SALES_ALL.includes(userInfo?.pos_role_id))
    ) {
      if (updatedLeadDetails?.data?.policyDetails) {
        updatedLeadDetails.data.policyDetails.policyDocUrlId = "";
        updatedLeadDetails.data.policyDetails.policyNumber = "";
        updatedLeadDetails.data.subStatus = "";
      }
    }
    return updatedLeadDetails;
  }

  public async sendPaymentOtp(body: any, userInfo: any) {
    const PRODUCT_LMW_API_MAP = {
      motorOnline: async () => {
        const queryParams =
          await this.motorProposalService.prepareProposalSubmitParams(
            body,
            userInfo
          );
        const res = await this.leadMiddlewareService.sendPaymentOtp(
          queryParams
        );
        return res;
      },
      life: async () => {
        const updatedBody = {
          ...body,
          iamUuid: userInfo?.uuid ?? null,
        };
        const res = await this.leadMiddlewareService.sendPaymentOtp(
          updatedBody
        );
        return res;
      },
      nonMotor: async () => {
        const updatedBody = {
          ...body,
          iamUuid: userInfo?.uuid ?? null,
          productType: body.product,
        };
        const res = await this.nonMotorLmwService.sendPaymentOtp(updatedBody);
        return res;
      },
      health: async () => {
        const updatedBody = {
          ...body,
          iamUuid: userInfo?.uuid ?? null,
        };
        const res = await this.healthLeadMiddlewareService.sendPaymentOtp(
          updatedBody
        );
        return res;
      },
    };

    if (LMWConstants.OTP_NON_MOTOR_PRODUCT_TYPES.includes(body.product)) {
      return PRODUCT_LMW_API_MAP[body.category]?.();
    }

    if (!PRODUCT_LMW_API_MAP[body.product]) {
      throw new BadRequestException("Invalid product passed!!!");
    }
    return PRODUCT_LMW_API_MAP[body.product]?.();
  }

  public async verifyPaymentOtp(body: any, userInfo: any) {
    const updatedBody = { ...body, iamUuid: userInfo?.uuid ?? null };
    const PRODUCT_LMW_API_MAP = {
      motorOnline: async () => {
        const res = await this.leadMiddlewareService.verifyPaymentOtp(
          updatedBody
        );
        return res;
      },
      life: async () => {
        const res = await this.leadMiddlewareService.verifyPaymentOtp(
          updatedBody
        );
        return res;
      },
      nonMotor: async () => {
        const res = await this.nonMotorLmwService.verifyPaymentOtp(updatedBody);
        return res;
      },
      health: async () => {
        const res = await this.healthLeadMiddlewareService.verifyPaymentOtp(
          updatedBody
        );
        return res;
      },
    };

    if (LMWConstants.OTP_NON_MOTOR_PRODUCT_TYPES.includes(body.product)) {
      return PRODUCT_LMW_API_MAP[body.category]?.();
    }

    if (!PRODUCT_LMW_API_MAP[body.product]) {
      throw new BadRequestException("Invalid product passed!!!");
    }
    return PRODUCT_LMW_API_MAP[body.product]?.();
  }

  public async saveBankDetails(data: any): Promise<any> {
    try {
      const encryptionRequest = data?.details.find(
        (userData) =>
          userData.key === "accountNumber" ||
          userData.key === "bank_account_number"
      );
      const encryptedData = await this.encryptionService.encrypt([
        encryptionRequest?.value?.toString(),
      ]);
      encryptionRequest.value = encryptedData[0].ecrypted;
      encryptionRequest.masked_value = encryptedData[0].masked;
      const kycDataResponse = await this.kycService.postProposalBankDetailsData(
        data
      );
      const updatedBody = {
        bank_details_id: kycDataResponse?.bankDetailsId,
        leadId: data.lead_id,
        product: data.product,
        medium: data.medium,
      };
      const PRODUCT_LMW_API_MAP = {
        life: async () => {
          const res = await this.leadMiddlewareService.sendPaymentOtp(
            updatedBody
          );
          return res;
        },
        travel: async () => {
          const res = await this.nonMotorLmwService.updateLead(updatedBody);
          return res;
        },
        health: async () => {
          const res = await this.healthLeadMiddlewareService.sendPaymentOtp(
            updatedBody
          );
          return res;
        },
        groupHealth: async () => {
          const res = await this.nonMotorLmwService.updateLead(updatedBody);
          return res;
        },
      };
      if (!PRODUCT_LMW_API_MAP[data.product]) {
        throw new BadRequestException("Invalid product passed!!!");
      }
      return PRODUCT_LMW_API_MAP[data.product]?.();
    } catch (error) {
      throw new HttpException(error?.status || 500, error);
    }
  }
}
