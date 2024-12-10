import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { Request } from "express";
import CaseListingService from "./case-listing-v2-service";
import AgentProfileHelper from "./helpers/agent-profile-helper";
import ApiPosService from "./apipos-service";
import ContextHelper from "../services/helpers/context-helper";
import {
  POLICY_COUNT_DURATION,
  SMS_TEMPLATE_NAME,
  UTM_SOURCE,
  COMMUNICATION_TYPE,
  SMS_TEMPLATE_NAME_FUSION,
  WHATSAPP_TEMPLATE_NAME_FUSION,
} from "../constants/agent-profile.constants";
import { LMW_PRODUCT_SLUGS } from "../constants/case-listing.constants";
import moment from "moment";
import { UseCache } from "../decorators/use-cache.decorator";
import ItmsService from "../core/api-helpers/itms-service";
import ConfigService from "./config-service";
import { config } from "../constants/config.constants";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import FusionService from "../services/fusion-service";
import DealerService from "@/src/services/dealer-service";
import MasterAPIService from "@/src/services/master-service";

@Injectable()
export default class AgentProfileService {
  constructor(
    private commonApiHelper: CommonApiHelper,
    private caseListingService: CaseListingService,
    private apiPosService: ApiPosService,
    private agentProfileHelper: AgentProfileHelper,
    private itmsService: ItmsService,
    private configService: ConfigService,
    private masterService: MasterAPIService,
    private dealerService: DealerService,
    private fusionService: FusionService
  ) {}

  public async getAgentDetails(req: Request) {
    const profileId = req.params.profileId;
    const context = ContextHelper.getStore();
    const requestOrigin = context.get("medium");
    const certificateType: string = (req.query.certificate ?? "") as string;
    if (!!!profileId) {
      throw new HttpException("profile id not found", 400);
    }
    let { data: agentDetails } = await this.fetchAgentDetails(profileId);
    if (certificateType) {
      return await this.getCertificate(
        agentDetails[0]?.gcd_code,
        certificateType
      );
    }
    agentDetails = this.agentProfileHelper.transformAgentDetails(agentDetails);

    let cpsResponse = await this.dealerService.getDealersV2({
      status: 1,
      iam_uuid: agentDetails?.uuid,
    });
    cpsResponse = cpsResponse?.[0];
    cpsResponse.properties = JSON.parse(cpsResponse.properties ?? {});

    const cityDetails = await this.masterService.getMasterConfigData(
      "br2/master/pincode",
      {
        cityId: cpsResponse?.city_id,
        limit: 1,
      },
      "GET"
    );

    const { cityName, stateName } = cityDetails?.[0];
    cpsResponse.cityName = cityName;
    cpsResponse.stateName = stateName;

    if (cpsResponse?.data?.is_fusion_agent) {
      if (agentDetails.eligibleForLife) {
        cpsResponse.eligible_for_life = agentDetails.eligibleForLife;
      }
      if (cpsResponse?.data?.properties?.profile_picture) {
        agentDetails.photo = cpsResponse?.properties?.profile_picture;
      }
      if (cpsResponse?.data?.properties?.state) {
        agentDetails.stateName = cpsResponse?.properties?.state;
      }
      if (cpsResponse?.data?.properties?.city) {
        agentDetails.cityName = cpsResponse?.properties?.city;
      }
      const config = await this.fusionService.getAllLOBsForFusionAgent(
        cpsResponse,
        requestOrigin
      );

      const mappingForLobs = {
        car: "Car",
        health: "Health",
        bike: "Bike",
        investment: "Investment",
        life: "Life",
        // opd: "OPDHealthShield",
      };
      const fusionLobs = config?.fusionConfig?.insuranceLobs;
      if (fusionLobs) {
        const arrayOfLobs = [];
        for (const fusionLob of fusionLobs) {
          if (mappingForLobs[fusionLob.key]) {
            arrayOfLobs.push(mappingForLobs[fusionLob.key]);
          }
        }
        agentDetails.products = arrayOfLobs;
      }
    }

    const agentProperties =
      this.agentProfileHelper.agentPropertiesBuilder(cpsResponse);
    agentDetails = this.agentProfileHelper.addProducts(
      agentDetails,
      agentProperties?.eligibleForLife
    );
    agentDetails = {
      ...agentDetails,
      ...agentProperties,
    };
    const response =
      this.agentProfileHelper.agentDetailsResponseMapper(agentDetails);
    return response;
  }

  public async fetchQrCode(req: ReqWithUser) {
    const gcdCode = req.userInfo?.gcd_code;
    const userInfo = req.userInfo;
    const fusionQRFeatureFlag = req?.query?.fusionQRFeatureFlag;
    const host = req.headers["x-forwarded-host"];
    let medium =
      host === process.env.X_FORWAREDED_POS_APP_HOST
        ? process.env.APP_MEDIUM
        : process.env.POS_MEDIUM;

    if (userInfo?.is_fusion_agent) {
      medium = process.env.FUSION_MEDIUM;
    }
    //visibility config
    const isEnabled = await this.isQrEnabled(userInfo);
    if (!isEnabled && !fusionQRFeatureFlag) {
      throw new HttpException("QR sharing not available", 403);
    }

    //fetch agent details
    const agentDetails = await this.apiPosService.fetchQrCode(gcdCode);
    const {
      qr_code: qrCode,
      profile_url: profileUrl,
      standee_link: standeeLink,
    } = agentDetails.user_properties;
    const utmString = new URLSearchParams({
      utm_medium: medium,
      utm_source: UTM_SOURCE.PREVIEW_MODE,
    }).toString();
    const utmUrl = `${profileUrl}?${utmString}`;
    const { url: urlShortned } = await this.itmsService.shortenUrl(utmUrl);
    return {
      qrCode,
      profileUrl: urlShortned,
      rawProfileUrl: profileUrl,
      standeeLink,
    };
  }

  @UseCache({ expiryTimer: 86400 })
  public async fetchAgentDetails(profileId: string) {
    const options = {
      endpoint: `${process.env.API_POS_ENDPOINT}/v1/agentProfile/${profileId}`,
    };
    const agentDetails: any = await this.commonApiHelper.fetchData(options, {});
    if (!agentDetails?.data?.length) {
      throw new HttpException(
        `Unable to fetch agent details for profileId: ${profileId}`,
        400
      );
    }
    return agentDetails;
  }

  @UseCache({ expiryTimer: 86400 })
  public async fetchAgentPolicyCount(uuid: string) {
    try {
      const filters = {
        createdDateRange: {
          startDate: moment()
            .subtract(POLICY_COUNT_DURATION, "days")
            .format("YYYY-MM-DD"),
          endDate: moment().format("YYYY-MM-DD"),
        },
        source: "ucd,saathi,agency,partner",
        channelIamId: uuid,
      };

      const promises = [];
      LMW_PRODUCT_SLUGS.forEach((product) => {
        const params = {
          filters: JSON.stringify(filters),
          medium: "POS",
        };
        promises.push(
          this.caseListingService.getCaseListingCount(product, params)
        );
        if (product === "motor") {
          params["filters"] = JSON.stringify({
            ...filters,
            policyMedium: "offline",
          });
          promises.push(
            this.caseListingService.getCaseListingCount(product, params)
          );
        }
      });
      const lmwPromiseResult = await Promise.all(promises);
      if (!!!lmwPromiseResult) {
        return 0;
      }
      const count = lmwPromiseResult.reduce((sum: number, policies: any) => {
        const issued = policies?.totalCount?.issued || 0;
        return sum + issued;
      }, 0);
      return count;
    } catch (error) {
      Logger.error(
        "Error while fetching policy count from lmw.... Returning 0 as default count"
      );
      return 0;
    }
  }

  public async getCertificate(gcdCode: string, certificate: string) {
    const options = {
      endpoint: `${process.env.API_POS_ENDPOINT}/v2/certificates/${gcdCode}`,
    };
    const body = {
      type: certificate,
    };
    const result = await this.commonApiHelper.postData(options, body);
    return result?.data;
  }

  public async shareProfile(body: any, headers: any, userInfo: any) {
    try {
      const host = headers["x-forwarded-host"];
      let medium =
        host === process.env.X_FORWAREDED_POS_APP_HOST
          ? process.env.APP_MEDIUM
          : process.env.POS_MEDIUM;
      const { mobile, profileUrl, type } = body;
      const { first_name, is_fusion_agent: isFusionAgent } = userInfo;
      if (isFusionAgent) {
        medium = process.env.FUSION_MEDIUM;
      }
      const utmString = new URLSearchParams({
        utm_medium: medium,
        utm_source: UTM_SOURCE.SHARE_LINK,
      }).toString();
      const utmUrl = `${profileUrl}?${utmString}`;
      const { url: urlShortned } = await this.itmsService.shortenUrl(utmUrl);
      if (type === COMMUNICATION_TYPE.WHATSAPP) {
        if (isFusionAgent) {
          const data = {
            mobile,
            first_name,
            urlShortned,
            headers,
          };
          await this.sendWhatsappCommunicationToFusionPartner(data);
        }
        return {
          url: urlShortned,
        };
      }
      const communicationPaylod = {
        type: COMMUNICATION_TYPE.SMS,
        mobile,
        templateName: SMS_TEMPLATE_NAME,
        variables: {
          agent_name: first_name,
          Link: urlShortned,
        },
      };
      if (isFusionAgent) {
        communicationPaylod.templateName = SMS_TEMPLATE_NAME_FUSION;
      }

      const result = await this.apiPosService.sendCommunication(
        communicationPaylod,
        headers
      );
      Logger.debug("response from communication service", { result });
      if (result.status !== 200) {
        throw new HttpException(
          "Unable to share agent profile",
          HttpStatus.BAD_REQUEST
        );
      }
      return {
        message: "Success response from communication service",
        url: urlShortned,
      };
    } catch (error) {
      Logger.error("Unable to send communication", { error });
      throw new HttpException(
        "Unable to share agent profile",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  public async isQrEnabled(userInfo: any) {
    if (!userInfo?.gcd_code) {
      return false;
    }
    if (userInfo?.tenant_id === null || userInfo?.tenant_id === 0) {
      userInfo.tenant_id = 1;
    }
    const qrConfig = await this.configService.getConfigValueByKey(
      config.QR_CODE
    );
    const isEnabled = this.configService.checkConditions(
      qrConfig?.conditions ?? [],
      userInfo
    );
    return isEnabled;
  }
  public async sendWhatsappCommunicationToFusionPartner(payload: any) {
    const communicationPaylod = {
      type: COMMUNICATION_TYPE.WHATSAPP,
      mobile: payload.mobile,
      templateName: WHATSAPP_TEMPLATE_NAME_FUSION,
      variables: {
        agent_name: payload.first_name,
        Link: payload.urlShortned,
      },
    };
    const result = await this.apiPosService.sendCommunication(
      communicationPaylod,
      payload.headers
    );
    Logger.debug("response from communication service for whatsapp", {
      result,
    });
  }
}
