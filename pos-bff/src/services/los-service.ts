import CommonApiHelper from "./helpers/common-api-helper";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import ContextHelper from "./helpers/context-helper";

const getHeaders = () => {
  if (ContextHelper?.getStore()?.get("authorization")) {
    return {
      authorization: ContextHelper.getStore().get("authorization"),
      "x-correlation-id": ContextHelper.getStore().get("x-correlation-id"),
    };
  }
  return;
};

@Injectable()
export default class LOSService {
  constructor(private commonApiHelper: CommonApiHelper) {}

  public async createLead(body): Promise<any> {
    Logger.debug("creating lead ", body);
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.postData(options, body);
    return response;
  }

  public async updateLead(leadId, body): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.putData(options, body);
    return response;
  }

  public async fetchLeadAggregations(filterParams): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/aggregate`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.fetchData(
      options,
      filterParams
    );
    return response;
  }

  public async fetchLeadList(filterParams): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.fetchData(
      options,
      filterParams
    );
    return response;
  }

  public async fetchLeadDetails(leadId, filterParams): Promise<any> {
    Logger.debug("fetching lead details for lead " + leadId, filterParams);
    try {
      if (!leadId) {
        throw new HttpException(
          "lead id cannot be empty",
          HttpStatus.BAD_REQUEST
        );
      }
      const options = {
        endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/${leadId}`,
        config: {
          headers: getHeaders(),
        },
      };
      const response: any = await this.commonApiHelper.fetchData(
        options,
        filterParams
      );
      return response.data;
    } catch (error) {
      if (error.status == 404) {
        return {};
      }
      throw new HttpException(
        error?.response?.message ?? error?.message,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  public async getTrainingConfiguration(leadId, filterParams): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/training/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.fetchData(
      options,
      filterParams
    );
    return response;
  }

  public async updateLeadStatus(leadId, body): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/status/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.putData(options, body);
    return response;
  }

  public async updateDocument(leadId, body): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/document/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.postData(options, body);
    return response;
  }

  public async updateAddress(leadId, body): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/address/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.putData(options, body);
    return response;
  }

  public async updateLeadProfile(leadId, body): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/profile/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.putData(options, body);
    return response;
  }

  public async updateBankDetails(leadId, body): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/bank/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.putData(options, body);
    return response;
  }

  public async verifyBankDetails(body): Promise<any> {
    try {
      Logger.debug(
        "Verification of bank details is in proccess for lead " + body.uuid
      );
      const options = {
        endpoint: `${process.env.LOS_ENDPOINT}/api/v1/account/verify`,
        config: {
          headers: getHeaders(),
        },
      };
      const response = await this.commonApiHelper.postData(options, body);
      return response.data;
    } catch (err) {
      throw new HttpException(err, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  public async fetchLeadKYC(leadId, body): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/ckyc/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const requestBody = {
      pan: body.pan,
      dateOfBirth: body.dateOfBirth,
    };
    const response = await this.commonApiHelper.postData(options, requestBody);
    return response;
  }

  public async updateLeadBasicDetails(body, leadId): Promise<any> {
    const existingLeadDetails = await this.fetchLeadDetails(leadId, {});
    const { bankDetails } = existingLeadDetails;
    const leadBasicDetailsRequest = await this.buildBasicDetailsRequest(body);
    const leadProfileDetailsRequest = await this.buildProfileDetailsRequest(
      body
    );
    const leadBankDetailsRequest = await this.buildBankDetailsRequest(
      body,
      bankDetails
    );
    const leadAddressDetailsRequest = await this.buildAddressDetailsRequest(
      body
    );
    await this.updateLead(leadId, leadBasicDetailsRequest);
    await this.updateLeadProfile(leadId, leadProfileDetailsRequest);
    if (leadBankDetailsRequest) {
      await this.updateBankDetails(leadId, leadBankDetailsRequest);
    }
    await this.updateAddress(leadId, leadAddressDetailsRequest);
    return {};
  }

  private async buildBasicDetailsRequest(body) {
    const cityId = body?.city_id;
    const basicDetailsRequest = {
      name: body.name,
      email: body.email,
      referenceAuthId: body.referenceAuthId,
    };
    if (cityId) {
      basicDetailsRequest["cityId"] = cityId;
    }
    return basicDetailsRequest;
  }

  private async buildProfileDetailsRequest(body) {
    const profileDetailsRequest = {
      dateOfBirth: body.dateOfBirth,
      pan: body.pan,
      educationDetails: body.education_certificate
        ? body.education_certificate
        : "",
    };
    return profileDetailsRequest;
  }

  private async buildBankDetailsRequest(body, existingBankDetails) {
    const bankDetailsRequest = {
      ifsc: body.ifsc_code ? body.ifsc_code : body.ifsc,
      accountNumber: body.account_number
        ? body.account_number
        : body.accountNumber,
      beneficiaryName: body.beneficiaryName,
      bankName: body.bank_name ? body.bank_name : body.bankName,
      doPennyTesting: false,
      isJointAccount: body.isJointAccount,
    };
    if (
      !bankDetailsRequest?.ifsc &&
      !bankDetailsRequest?.accountNumber &&
      !bankDetailsRequest?.bankName &&
      body.isJointAccount == null
    ) {
      return null;
    }
    if (existingBankDetails && existingBankDetails.length) {
      const existingBankDetail = existingBankDetails[0];
      if (bankDetailsRequest.ifsc == null) {
        bankDetailsRequest.ifsc = existingBankDetail.ifsc;
      }
      if (bankDetailsRequest.accountNumber == null) {
        const accountNumberEncrypted =
          existingBankDetail.accountNumberEncrypted;
        const data = [];
        data.push(accountNumberEncrypted);
        const decryptionOptions = {
          endpoint: process.env.DECRYPTION_SERVICE_V2_END_POINT,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.DECRYPTION_SERVICE_AUTH_TOKEN,
          },
        };
        const encryptedData = { data: data };
        const decryptionResponse = await this.commonApiHelper.postData(
          decryptionOptions,
          encryptedData
        );
        Logger.debug("Decryption Response", decryptionResponse);
        if (decryptionResponse) {
          bankDetailsRequest.accountNumber =
            decryptionResponse["data"][accountNumberEncrypted].decrypted;
        }
      }
      if (bankDetailsRequest.bankName == null) {
        bankDetailsRequest.bankName = existingBankDetail.bankName;
      }
    }
    return bankDetailsRequest;
  }

  private async buildAddressDetailsRequest(body) {
    const addresses = [];
    const homeAddress = {
      type: "HOME",
      pincode: body?.pin_code,
      cityId: body?.city_id,
      stateId: body?.state_id,
      fullAddress: body?.address,
      locality: body?.locality,
    };
    const workAddress = {
      type: "WORK",
      pincode: body?.work_pin_code,
      cityId: body?.work_city_id,
      stateId: body?.work_state_id,
      fullAddress: body?.work_address,
      locality: body?.work_locality,
    };
    if (body?.gst_reg === "1") {
      workAddress["gstNumber"] = body?.gst_no;
    } else {
      workAddress["gstNumber"] = "";
    }
    addresses.push(workAddress, homeAddress);
    const addressDetailsRequest = {
      addresses,
    };
    return addressDetailsRequest;
  }

  public async triggerLeadEvent(filterParams): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/event`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.postData(options, {
      leadId: filterParams?.leadId,
      leadTrigger: filterParams?.leadTrigger,
      data: filterParams?.data,
    });
    return response;
  }

  public async updateLeadFollowUp(body): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/followup/${body.leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    return await this.commonApiHelper.putData(options, body);
  }
  public async updateTrainingStatus(leadId, body): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/training/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.putData(options, body);
    return response;
  }

  public async updateAdditionalDetails(leadId, body): Promise<any> {
    Logger.debug("updating lead additional details for lead " + leadId, body);
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/additional-details/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.putData(options, body);
    return response;
  }

  public async fetchAdditionalDetails(leadId, body): Promise<any> {
    try {
      Logger.debug("fetching lead additional details for lead " + leadId, body);
      const options = {
        endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/additional-details/${leadId}`,
        config: {
          headers: getHeaders(),
        },
      };
      const response: any = await this.commonApiHelper.postData(options, body);
      return response.data.data;
    } catch (err) {
      Logger.error(
        "some error occurred in fetching lead additional details ",
        err
      );
      return {};
    }
  }

  public async triggerEvent(body): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/event`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.postData(options, body);
    return response;
  }

  public async searchLeads(params): Promise<any> {
    Logger.debug("searching for leads", params);
    const options = {
      endpoint: process.env.LOS_ENDPOINT + "/api/v1/leads/search",
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.postData(options, params);
    return response;
  }

  public async fetchDigilockerDetails(
    params: any,
    codeVerifier: string
  ): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/digilocker`,
      config: {},
    };
    const requestParams = {
      code: params.code,
      uuid: params.uuid,
      source: params.source,
      codeVerifier,
    };
    const response = await this.commonApiHelper.fetchData(
      options,
      requestParams
    );
    return response;
  }

  public async fetchRejectionRemarks(category_type): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/remarks?category=${category_type}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.fetchData(options, {});
    return response;
  }

  public async reRegisterLead(leadId): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/re-register/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.putData(options, {});
    return response;
  }

  public async checkIsNocRequired(leadId, body) {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/noc-required/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.postData(options, body);
    return response.data;
  }

  public async sendAadhaarOtp(body) {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/aadhaar/otp`,
      config: {
        headers: getHeaders(),
      },
    };
    const response = await this.commonApiHelper.postData(options, body);
    return response.data;
  }

  public async submitAadhaarOtp(leadId, body): Promise<any> {
    const options = {
      endpoint: `${process.env.LOS_ENDPOINT}/api/v1/leads/aadhaar/${leadId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const requestBody = {
      requestId: body.requestId,
      otp: body.otp,
      getProfileImage: true,
    };
    const response = await this.commonApiHelper.postData(options, requestBody);
    return response;
  }
}
