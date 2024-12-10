import { Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import LOSService from "./los-service";
import LeadUtils from "../utils/lead-utils";
import moment from "moment";
import ContextHelper from "./helpers/context-helper";
import DocumentService from "../core/api-helpers/document-service";
import UtilityService from "./utility-service";

@Injectable()
export default class ManageLeadService {
  constructor(
    private apiHelper: CommonApiHelper,
    private losService: LOSService,
    private documentService: DocumentService,
    private utilityService: UtilityService
  ) {}

  public async getLeadDetails(params: Object): Promise<any> {
    Logger.debug("fetching leads  ", params);
    try {
      const options = {
        endpoint: process.env.API_POS_ENDPOINT + "/v1/leads/search",
      };
      const leadDetailsResponseData: any = await this.apiHelper.fetchData(
        options,
        params
      );
      Logger.debug("leadDetails Response", leadDetailsResponseData);
      return leadDetailsResponseData;
    } catch (error) {
      Logger.error(error);
      const data = [];
      return data;
    }
  }

  public async leadSearchByMobileOrEmail(params: any): Promise<any> {
    try {
      const reqParams: any = {
        getAllLeads: 1,
        isAggregate: 0,
      };
      reqParams.filterInput = params.mobile;
      const mobResp = await this.losService.searchLeads(reqParams);
      if (mobResp?.data?.data?.length > 0) {
        return mobResp;
      }

      reqParams.filterInput = params.email;
      const emailResp = await this.losService.searchLeads(reqParams);
      if (emailResp?.data?.data?.length > 0) {
        return emailResp;
      }
      return [];
    } catch (error) {
      Logger.error("error while searching leads By Mobile or email", { error });
      return [];
    }
  }

  public async leadSearchByMobileAndEmail(params: any): Promise<any> {
    const reqParams: any = {
      getAllLeads: 1,
      isAggregate: 0,
    };
    const results: any = {};
    if (params.mobile) {
      reqParams.filterInput = params.mobile;
      const mobResp = await this.losService.searchLeads(reqParams);
      if (mobResp?.data?.data?.length > 0) {
        results.mobile = mobResp.data.data;
      }
    }
    if (params.email) {
      reqParams.filterInput = params.email;
      const emailResp = await this.losService.searchLeads(reqParams);
      if (emailResp?.data?.data?.length > 0) {
        results.email = emailResp.data.data;
      }
    }
    return Object.keys(results).length > 0 ? results : {};
  }

  public async handleTestClearance(body: any, userInfo: any): Promise<any> {
    const apiParams = {
      insuranceType: body.insuranceType,
    };
    const headers = {
      authorization: ContextHelper.getStore().get("authorization"),
    };
    const source = ContextHelper.getStore().get("medium");
    const email = userInfo.email;
    const docRequest = {
      headers: headers,
      doc_ids: [body.documentId],
    };
    const docServiceResponse = await this.documentService.addRegisterDocumentV2(
      docRequest.headers,
      docRequest.doc_ids
    );
    const doc = docServiceResponse?.data?.docs?.[0] ?? {};
    const { file_extension: fileExtension, access_id: accessId } = doc;
    const docUrl =
      `${process.env.DOC_SERVICE_URL}doc-service/v1/documents/` + accessId;

    const file = {
      link: docUrl,
      extension: fileExtension,
    };

    //pass data to utility
    const data = await this.utilityService.uploadData(
      "leadExam",
      apiParams,
      headers,
      source,
      email,
      file,
      []
    );

    return data;
  }

  public async searchLeads(params: any): Promise<any> {
    Logger.debug("fetching leads  ", params);
    try {
      if (params.limit && params.limit < 500) {
        params.size = params.limit;
      } else {
        params.size = 500;
      }
      const leadDetailsResponseData: any = await this.losService.searchLeads(
        params
      );
      Logger.debug("leadDetails Response", leadDetailsResponseData);
      return this.map(leadDetailsResponseData, params);
    } catch (error) {
      Logger.error("error while searching leads", { error });
      const data = [];
      return data;
    }
  }

  private map(leadDetailsResponseData: any, params: any) {
    if (
      leadDetailsResponseData &&
      leadDetailsResponseData.data &&
      leadDetailsResponseData.data.data &&
      leadDetailsResponseData.data.data.length > 0
    ) {
      Logger.debug("mapping los lead search response ");
      const transformedDataList = [];
      leadDetailsResponseData.data.data.map((leadData) => {
        const leadStateLabel = LeadUtils.getLeadStatusLabel(leadData.leadState);
        const transformedData = {
          id: leadData?.id,
          reRegister: leadData?.reRegister ?? false,
          nocRequired: leadData?.nocRequired ?? false,
          gcd_code: leadData.gcdCode != null ? leadData.gcdCode : "",
          uuid: leadData?.uuid,
          created_at: leadData?.createdAt,
          updated_at: leadData?.updatedAt,
          lead_state: leadData?.leadState,
          lead_state_label: leadStateLabel != null ? leadStateLabel : "",
          irda_id: leadData?.irdaId,
          irda_reporting_date: leadData?.irdaReportingDate,
          name: leadData?.name,
          mobile_hash: leadData?.mobileHash,
          email_hash: leadData?.emailHash,
          mobile_encrypt: leadData?.mobileEncrypted,
          mobile_mask: leadData?.mobileMask,
          email_encrypt: leadData?.emailEncrypted,
          email_mask: leadData?.emailMask,
          lead_origin: leadData?.leadOrigin,
          lead_owner_uuid: leadData?.leadOwnerIamUUID,
          lead_creater_uuid: leadData?.leadCreatorIamUUID,
          refer_dealer_id: leadData?.referDealerId,
          path: leadData?.path,
          utm_source: leadData?.utmSource,
          life_insurance_reg: leadData?.lifeInsuranceReg,
          general_insurance_reg: leadData?.generalInsuranceReg,
          reg_remarks: leadData?.leadRejectionReason,
          leadHistory: leadData?.leadHistory,
        };
        if (params.isDownload) {
          if (transformedData?.leadHistory) {
            Object.keys(transformedData.leadHistory).map((key) => {
              transformedData.leadHistory[key].timestamp = moment(
                transformedData.leadHistory[key].timestamp
              ).format("YYYY-MM-DD");
            });
          }
          transformedData["life_insurance_reg_exam_status"] =
            leadData?.lifeInsuranceReg
              ? LeadUtils.getLeadExamStatusLabel(
                  leadData?.lifeInsuranceReg?.exam_status
                )
              : null;
          transformedData["life_insurance_reg_last_updated"] =
            leadData?.lifeInsuranceReg
              ? leadData?.lifeInsuranceReg?.last_updated
              : null;
          transformedData["general_insurance_reg_exam_status"] =
            leadData?.generalInsuranceReg
              ? LeadUtils.getLeadExamStatusLabel(
                  leadData?.generalInsuranceReg?.exam_status
                )
              : null;
          transformedData["general_insurance_reg_last_updated"] =
            leadData?.generalInsuranceReg
              ? leadData?.generalInsuranceReg?.last_updated
              : null;
          transformedData["assignee_details_name"] = leadData?.assigneeDetails
            ? leadData?.assigneeDetails?.name
            : null;
          transformedData["assignee_details_email"] = leadData?.assigneeDetails
            ? leadData?.assigneeDetails?.email
            : null;
          transformedData["master_gcd_code"] = leadData?.masterDetails
            ? leadData?.masterDetails?.gcdCode
            : null;
          transformedData["zonal_head_name"] = leadData?.hierarchyDetails
            ?.zonal_head
            ? leadData?.hierarchyDetails?.zonal_head?.name
            : null;
          transformedData["user_type"] = leadData?.referDealerId
            ? "RAP"
            : "Master";
          transformedData["lead_origin"] = LeadUtils.getLeadOrigin(
            leadData?.leadOrigin
          );
          transformedData["pos_creation_date"] = leadData?.posCreationDate
            ? moment(leadData?.posCreationDate).format("YYYY-MM-DD")
            : null;
          transformedData["national_head_name"] = leadData?.hierarchyDetails
            ?.national_head
            ? leadData?.hierarchyDetails?.national_head?.name
            : null;
        }
        transformedDataList.push(transformedData);
      });
      leadDetailsResponseData.data.data = transformedDataList;
    }
    return leadDetailsResponseData;
  }

  public async handleBulkUpload(body: any, userInfo: any) {
    try {
      const headers = {
        authorization: ContextHelper.getStore().get("authorization"),
      };
      const source = ContextHelper.getStore().get("medium");
      const email = userInfo.email;
      const type = body.type;
      const docRequest = {
        headers: headers,
        doc_ids: [body.documentId],
      };
      const docServiceResponse =
        await this.documentService.addRegisterDocumentV2(
          docRequest.headers,
          docRequest.doc_ids
        );
      const doc = docServiceResponse?.data?.docs?.[0] ?? {};
      const { file_extension: fileExtension, access_id: accessId } = doc;
      const docUrl =
        `${process.env.DOC_SERVICE_URL}doc-service/v1/documents/` + accessId;

      const file = {
        link: docUrl,
        extension: fileExtension,
      };

      const data = await this.utilityService.uploadData(
        type,
        null,
        headers,
        source,
        email,
        file,
        []
      );
      return { data, status: 200, message: "Request Redirected" };
    } catch (err) {
      Logger.error("Error sending request:", { err });
      return { status: 500, message: "Internal Server error", data: err };
    }
  }
}
