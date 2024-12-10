import DealerService from "./dealer-service";
import { RulesDetails } from "../interfaces/ifm/score-details-response.interface";
import MasterAPIService from "./master-service";
import { Injectable, Logger } from "@nestjs/common";
import {
  ChannelPartnerSubTypes,
  ChannelPartnerTypes,
} from "../constants/channel-partners.constants";
import ConfigService from "./config-service";
import {
  defaultVehicleSubType,
  vehicleTypeTpTenureMapping,
} from "../constants/quotes.constants";
import { config } from "../constants/config.constants";
import IFMApiService from "./ifm-service";
import { NonAgentSalesRoles, PosRoles } from "../constants/pos-roles.constants";
import { InsurerData } from "../interfaces/master/master-data-response.interface";
import QuotesService from "./quotes-service";
import { isEmpty } from "lodash";

@Injectable()
export default class PointsManagementService {
  constructor(
    private dealerService: DealerService,
    private masterAPIService: MasterAPIService,
    private quotesService: QuotesService,
    private configService: ConfigService,
    private ifmApiService: IFMApiService
  ) {}

  public async checkScoreCardVisible(
    body: any,
    isUserAuthenticated: boolean,
    userInfo: any
  ): Promise<any> {
    let showScoreCard = false;
    let gcdCode = userInfo?.gcd_code;
    let dealerDetails = [];
    if (!isUserAuthenticated) {
      return { showScoreCard, dealerDetails };
    }
    const product = body.product;
    if (NonAgentSalesRoles.includes(userInfo?.pos_role_id)) {
      body.dealerId = userInfo.dealer_id;
    }

    if (!body.dealerId) {
      Logger.debug(
        "pos_role_id found but dealer_id empty. Therefore, GCD code could not be found",
        {
          pos_role_id: userInfo?.pos_role_id,
          dealer_id: body.dealerId,
        }
      );
      return { showScoreCard, dealerDetails };
    }

    // {"1":{"aggregator":true,"rap":true,"subAgent":false},"79":{"aggregator":true,"rap":true,"subAgent":false}}
    const scoreCardTenantVisibility =
      await this.configService.getConfigValueByKey(
        config.SCORE_CARD_VISIBILITY
      );
    if (!scoreCardTenantVisibility[userInfo?.tenant_id || 1]) {
      Logger.debug(
        "score card not configured for this tenant id ",
        userInfo?.tenant_id || 1
      );
      return { showScoreCard, dealerDetails };
    }
    const scorePopUpProductConfig =
      await this.configService.getConfigValueByKey(
        config.SCORE_CARD_PRODUCT_CONFIG
      );

    if (
      (product === "motor" &&
        !scorePopUpProductConfig[product]?.[
          body.vehicleCategory || body.vehicleType
        ]?.enabled) ||
      (product !== "motor" && !scorePopUpProductConfig[product]?.enabled)
    ) {
      Logger.debug("score card not configured for this product", {
        product,
        isMotor: product === "motor",
        isEnabled:
          !scorePopUpProductConfig[product]?.[
            body.vehicleCategory || body.vehicleType
          ]?.enabled,
      });
    }

    const tenantUsersEligible =
      scoreCardTenantVisibility[userInfo?.tenant_id || 1];
    const params = { dealer_id: body.dealerId };
    dealerDetails = await this.dealerService.getDealerDetails(params);
    if (!dealerDetails?.length) {
      Logger.debug("no dealer details found for dealer", {
        delaerId: body.dealerId,
      });
      return { showScoreCard, dealerDetails };
    }
    if (userInfo?.pos_role_id !== 3) {
      gcdCode = dealerDetails?.[0]?.gcd_code;
      userInfo.gcd_code = gcdCode;
    }

    if (
      (product === "motor" &&
        scorePopUpProductConfig[product][
          body.vehicleCategory || body.vehicleType
        ].allGcd) ||
      (product !== "motor" && scorePopUpProductConfig[product]?.allGcd)
    ) {
      if (
        !tenantUsersEligible.subAgent &&
        userInfo?.pos_role_id === PosRoles.SubAgent
      ) {
        Logger.debug(
          "user does not meet the visibility criteria for sub-agent"
        );
        return { showScoreCard, dealerDetails };
      }

      if (
        !tenantUsersEligible.aggregator &&
        dealerDetails[0].channel_partner_sub_type ===
          ChannelPartnerSubTypes.AGGREGATOR
      ) {
        Logger.debug(
          "user does not meet the visibility criteria for aggregator"
        );
        return { showScoreCard, dealerDetails };
      }

      if (!tenantUsersEligible.rap && userInfo?.refer_dealer_id) {
        showScoreCard = false;
        Logger.debug("user does not meet the visibility criteria for rap");
        return { showScoreCard, dealerDetails };
      }

      if (
        tenantUsersEligible?.disableForChannels?.length &&
        tenantUsersEligible.disableForChannels.includes(
          dealerDetails[0]?.channel_partner_type
        )
      ) {
        Logger.debug(
          "user does not meet the visibility criteria for channel partner type"
        );
        return { showScoreCard, dealerDetails };
      }
      showScoreCard = true;
    } else {
      const gcdCodesForScorePopup =
        scorePopUpProductConfig[body.product]?.gcdCode;
      if (gcdCode && gcdCodesForScorePopup?.includes(gcdCode)) {
        showScoreCard = true;
      }
    }
    Logger.debug("Final gcdCode", { gcdCode });

    if (!showScoreCard) {
      // eligibility criteria not met
      return { showScoreCard, dealerDetails };
    }
    return { showScoreCard, dealerDetails };
  }

  public async calculateScoreDetails(
    body: any,
    dealerDetails: any,
    userInfo: any
  ): Promise<any> {
    let showScoreCard = false;
    const channelType =
      ChannelPartnerTypes[dealerDetails?.[0]?.channel_partner_type];
    const channelSubType =
      channelType !== ChannelPartnerTypes.PARTNER
        ? Number(dealerDetails?.[0]?.channel_partner_sub_type)
        : undefined;
    const scoreDetails = await this.getScoreCardDetails(
      body,
      userInfo.gcd_code,
      channelType,
      channelSubType
    );
    showScoreCard = true;
    return { showScoreCard, scoreDetails };
  }

  public async getScoreCardDetails(
    body: any,
    gcdCode: string,
    channelType: Number,
    channelSubType: Number
  ): Promise<any> {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    if (body.caseType === 1) {
      body.tpTenure = vehicleTypeTpTenureMapping[body.vehicleType];
    } else {
      body.tpTenure = 1;
    }
    body.vehiclePermitUsageTypes = body.vehicleType === 9 ? 2 : null;
    body.vehicleSubType =
      body.vehicleSubType || defaultVehicleSubType[body.vehicleType];
    if (!body.insurer) {
      delete body.insurer;
    }
    const pointsRes = this.ifmApiService.getPointsData(
      body.domain,
      body.vehicleType,
      body.vehicleSubType,
      body.caseType,
      body.policyType,
      body.modeOfPayment,
      body.fuelType,
      body.make,
      body.model,
      body.variant,
      body.vehicleCC,
      body.seatingCapacity,
      body.bookingMode,
      body.zeroOrNoDept,
      body.isNcb,
      body.vehicleUsageType,
      body.ownerType,
      body.registrationDate,
      body.manufacturingDate,
      formattedDate,
      formattedDate,
      formattedDate,
      body.rtoCode,
      gcdCode,
      channelType,
      channelSubType,
      body.fourthYearRenewal,
      body.isRenewal,
      body.tpTenure,
      body.cpaOptIn,
      Number(body.grossVehicleWeight),
      body.vehicleSubUsageType,
      body.vehiclePermitUsageTypes,
      body.insurer,
      body.kitType
    );
    const params = {
      subSource: "INSURANCEDEKHO",
      medium: "INSURANCEDEKHO",
      source: "B2B",
      masterType: "insurer",
      subProductTypeId: 1,
    };
    const scoresRes = this.masterAPIService.getMasterData(params);
    const [scores, masterRes] = await Promise.all([pointsRes, scoresRes]);
    if (!scores.length) {
      return [];
    }
    const scoresWithInsurerImages = scores.map((score: RulesDetails) => {
      const insurerIndex = masterRes.insurers.findIndex(
        (insurer: InsurerData) =>
          insurer.insurerId === score.rules[0].ruleValue.insurerId
      );
      if (insurerIndex > -1) {
        return {
          ...score,
          insurerImage: masterRes.insurers[insurerIndex].insurerImage,
          insurerName: masterRes.insurers[insurerIndex].insurerName,
          insurerShortName: masterRes.insurers[insurerIndex].shortName,
        };
      } else {
        Logger.debug("no insurer image found", {
          insurerId: score.rules[0].ruleValue.insurerId,
        });
        return score;
      }
    });
    const sortedScores = scoresWithInsurerImages.sort(
      (score1: any, score2: any) =>
        score2.rules[0].ruleValue.commissionAttributes.totalCommission -
        score1.rules[0].ruleValue.commissionAttributes.totalCommission
    );
    return sortedScores;
  }

  public async checkScoreHeaderVisible(userInfo: any): Promise<any> {
    let showScoreHeader = false;
    const gcdCode = userInfo.gcd_code;
    const tenantId = userInfo.tenant_id;

    if (
      (userInfo.pos_role_id === PosRoles.Agent ||
        userInfo.pos_role_id === PosRoles.SubAgent) &&
      !gcdCode
    ) {
      Logger.debug(
        "gcd code is empty. Therefore, no score header to be shown",
        {
          pos_role_id: userInfo.pos_role_id,
          gcdCode,
        }
      );
      return { showScoreHeader };
    }

    // {"1":{"enabled":true,"allGcd":false,"gcdCode":["GID101861"],"aggregator":false,"rap":false,"subAgent":false}}
    const scoreNavbarVisibility = await this.configService.getConfigValueByKey(
      config.SCORE_NAVBAR_CONFIG
    );
    if (!scoreNavbarVisibility[tenantId || 1]) {
      Logger.debug("score navbar not configured for this tenant id ", {
        tenantId: tenantId || 1,
      });
      return { showScoreHeader };
    }

    const tenantUsersEligible = scoreNavbarVisibility[tenantId || 1];
    if (!tenantUsersEligible.enabled) {
      Logger.debug("score navbar not enabled for this tenant id", {
        tenantId: tenantId || 1,
      });
      return { showScoreHeader };
    }

    const params =
      userInfo.pos_role_id === PosRoles.Agent ||
      userInfo.pos_role_id === PosRoles.SubAgent
        ? { dealer_id: userInfo.dealer_id }
        : null;
    const dealerDetails = params
      ? await this.dealerService.getDealerDetails(params)
      : [];

    if (params && !dealerDetails?.length) {
      Logger.debug("checkScoreHeaderVisible no dealer details found in CPS", {
        delaerId: userInfo.dealerId,
      });
      return { showScoreHeader };
    }

    if (tenantUsersEligible.allGcd) {
      if (
        !tenantUsersEligible.subAgent &&
        userInfo.pos_role_id === PosRoles.SubAgent
      ) {
        Logger.debug(
          "checkScoreHeaderVisible user does not meet the visibility criteria for sub-agent"
        );
        return { showScoreHeader };
      }

      if (
        (userInfo.pos_role_id === PosRoles.SubAgent ||
          userInfo.pos_role_id === PosRoles.Agent) &&
        !tenantUsersEligible.aggregator &&
        dealerDetails?.[0]?.channel_partner_sub_type ===
          ChannelPartnerSubTypes.AGGREGATOR
      ) {
        Logger.debug(
          "checkScoreHeaderVisible user does not meet the visibility criteria for aggregator"
        );
        return { showScoreHeader };
      }

      if (!tenantUsersEligible.rap && userInfo?.refer_dealer_id) {
        Logger.debug(
          "checkScoreHeaderVisible user does not meet the visibility criteria for rap"
        );
        return { showScoreHeader };
      }

      if (
        tenantUsersEligible?.disableForChannels?.length &&
        tenantUsersEligible.disableForChannels.includes(
          dealerDetails[0]?.channel_partner_type
        )
      ) {
        Logger.debug(
          "checkScoreHeaderVisible does not meet the visibility criteria for channel partner type"
        );
        return { showScoreHeader };
      }

      Logger.debug("all criteria met by user for allGcd", {
        gcdCode,
        allGcd: tenantUsersEligible.allGcd,
      });
      showScoreHeader = true;
      return { showScoreHeader };
    }
    // allGcd = false
    const gcdCodesForScorePopup = tenantUsersEligible.gcdCode;
    if (userInfo.pos_role_id === PosRoles.SubAgent) {
      Logger.debug("subagent logged in checkscoreheadervisible allGcd=false", {
        gcdCode,
      });
      return { showScoreHeader };
    }

    if (userInfo.refer_dealer_id) {
      Logger.debug(
        "checkScoreHeaderVisible user does not meet the visibility criteria for rap allGcd=false"
      );
      return { showScoreHeader };
    }

    if (
      (userInfo.pos_role_id === PosRoles.SubAgent ||
        userInfo.pos_role_id === PosRoles.Agent) &&
      dealerDetails?.[0]?.channel_partner_sub_type ===
        ChannelPartnerSubTypes.AGGREGATOR
    ) {
      Logger.debug(
        "checkScoreHeaderVisible user does not meet the visibility criteria for aggregator allGcd=false"
      );
      return { showScoreHeader };
    }

    if (
      tenantUsersEligible?.disableForChannels?.length &&
      tenantUsersEligible.disableForChannels.includes(
        dealerDetails[0]?.channel_partner_type
      )
    ) {
      Logger.debug(
        "checkScoreHeaderVisible does not meet the visibility criteria for channel partner type allGcd=false"
      );
      return { showScoreHeader };
    }

    if (gcdCode && gcdCodesForScorePopup.includes(gcdCode)) {
      Logger.debug("checkScoreHeaderVisible allowed for this user", {
        gcdCode,
        allGcd: tenantUsersEligible.allGcd,
        tenantId,
      });
      showScoreHeader = true;
      return { showScoreHeader };
    }

    Logger.debug(
      "checkScoreHeaderVisible user does not satisfy any condition",
      {
        gcdCode,
        allGcd: tenantUsersEligible.allGcd,
        tenantId,
      }
    );
    return { showScoreHeader };
  }

  async getScoreCardWithQuotes(body: any, userInfo = null) {
    const isUserAuthenticated = !isEmpty(userInfo);
    Logger.debug("new score card API", {
      body: body,
    });
    const params = { dealer_id: userInfo?.refer_dealer_id };
    const [{ showScoreCard, dealerDetails }, rapDetails] = await Promise.all([
      this.checkScoreCardVisible(body, isUserAuthenticated, userInfo),
      userInfo?.refer_dealer_id && this.dealerService.getDealerDetails(params),
    ]);
    const channelType =
      ChannelPartnerTypes[dealerDetails?.[0]?.channel_partner_type];
    const channelSubType =
      channelType !== ChannelPartnerTypes.PARTNER
        ? Number(dealerDetails?.[0]?.channel_partner_sub_type)
        : null;
    const channelCity = dealerDetails?.[0]?.city_id;
    const masterGCDCode = rapDetails?.length ? rapDetails[0].gcd_code : "";
    const quotesAPIMapper = {
      health: async () =>
        this.quotesService.getHealthQuotesScoreCard(
          body,
          userInfo?.gcd_code,
          showScoreCard,
          channelType,
          channelSubType,
          masterGCDCode,
          channelCity
        ),
      hospicash: async () =>
        this.quotesService.getHospicashQuotes(
          body,
          userInfo?.gcd_code,
          showScoreCard,
          channelType,
          channelSubType,
          masterGCDCode,
          channelCity
        ),
      motor: async () =>
        this.quotesService.getMotorQuotes(
          body,
          showScoreCard,
          channelType,
          channelSubType,
          masterGCDCode,
          userInfo?.gcd_code
        ),
      travel: async () =>
        this.quotesService.getTravelQuotes(
          body,
          userInfo?.gcd_code,
          showScoreCard,
          channelType,
          channelSubType,
          masterGCDCode,
          channelCity
        ),
      pet: async () =>
        this.quotesService.getPetQuotes(
          body,
          userInfo?.gcd_code,
          showScoreCard,
          channelType,
          channelSubType,
          masterGCDCode,
          channelCity
        ),
      life: async () =>
        this.quotesService.getLifeQuotes(
          body,
          userInfo?.gcd_code,
          showScoreCard,
          channelType,
          channelSubType,
          masterGCDCode,
          channelCity
        ),
      fire: async () =>
        this.quotesService.getSMEQuotes(
          body,
          userInfo?.gcd_code,
          showScoreCard,
          channelType,
          channelSubType,
          masterGCDCode,
          channelCity
        ),
      specificMarine: async () =>
        this.quotesService.getSMEQuotes(
          body,
          userInfo?.gcd_code,
          showScoreCard,
          channelType,
          channelSubType,
          masterGCDCode,
          channelCity
        ),
      workmenCompensation: async () =>
        this.quotesService.getSMEQuotes(
          body,
          userInfo?.gcd_code,
          showScoreCard,
          channelType,
          channelSubType,
          masterGCDCode,
          channelCity
        ),
      professionalIndemnity: async () =>
        this.quotesService.getSMEQuotes(
          body,
          userInfo?.gcd_code,
          showScoreCard,
          channelType,
          channelSubType,
          masterGCDCode,
          channelCity
        ),
    };

    const quotesWithScores = (await quotesAPIMapper[body?.product]?.()) ?? {};
    quotesWithScores.gcdCode = userInfo?.gcd_code;
    if (
      body?.product === "health" ||
      body?.product === "motor" ||
      body?.product === "life"
    ) {
      quotesWithScores.showScoreCard = showScoreCard;
    }
    return quotesWithScores;
  }
}
