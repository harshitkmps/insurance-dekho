import { Controller, Get, Post, Req, Res, Logger } from "@nestjs/common";
import ejs from "ejs";
import moment from "moment";
import path from "path";
import PointsManagementService from "../services/points-management-service";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { sendResponse } from "../services/helpers/response-handler";
import QuotesService from "../services/quotes-service";
import { ChannelPartnerTypes } from "../constants/channel-partners.constants";
import DealerService from "../services/dealer-service";
import MotorProposalService from "../services/motor-proposal.service";
import HealthLeadService from "../services/health-lead.service";
import TravelProposalService from "../services/travel-proposal.service";
import HospicashService from "../services/hospicash-service";
import PetProposalService from "../services/pet-proposal.service";
import SmeProposalService from "../services/sme-proposal.service";
import CommonUtils from "../utils/common-utils";
import ContextHelper from "../services/helpers/context-helper";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import CommonApiHelper from "../services/helpers/common-api-helper";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { Response } from "express";

@Controller("/v2/points")
@ApiTags("Points Management Controller V2")
export class PointsManagementControllerV2 {
  private authMiddleware: AuthMiddleware;

  constructor(
    private pointsManagementService: PointsManagementService,
    private quotesService: QuotesService,
    private dealerService: DealerService,
    private motorProposalService: MotorProposalService,
    private healthLeadService: HealthLeadService,
    private travelProposalService: TravelProposalService,
    private hospicashService: HospicashService,
    private petProposalService: PetProposalService,
    private smeProposalService: SmeProposalService,
    private apiHelper: CommonApiHelper
  ) {
    this.authMiddleware = new AuthMiddleware(this.apiHelper);
  }

  @Post("/score-card")
  @ApiOperation({
    summary: "Return Quotes With Scores Info",
    requestBody: {
      description: "returns quotes with score card based on body provided",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              isShowODPolicyType: "1",
              insurers: "",
              policy_exp_before_90_days: "-1",
              prevPolicyType: "",
              sessionId: "",
              voluntaryDeductible: "0",
              isAaiMember: "0",
              isAntiTheftDeviceFitted: "0",
              isLOPBCoverInPrevPolicy: "1",
              isKeyCoverInPrevPolicy: "1",
              isTyreCoverInPrevPolicy: "1",
              isEngineCoverInPrevPolicy: "1",
              isInvoiceCoverInPrevPolicy: "1",
              isZeroDepInPrevPolicy: "1",
              isIMT23Cover: "0",
              isPassengerAssistCover: "0",
              isTyreSecure: "0",
              isEmergencyHotelTransport: "0",
              isLossOfPersonalBelonging: "0",
              isKeyReplacementCover: "0",
              isHydrostaticLockCover: "0",
              isAmbulanceCover: "0",
              isMedicalCover: "0",
              isHospitalCover: "0",
              isNcbProtectionCover: "0",
              isEngineProtection: "0",
              isConsumablesCover: "0",
              isInvoiceCover: "0",
              isRsaCover: "1",
              isZeroDep: "0",
              nonElectricalAccessories: "0",
              electricalAccessories: "0",
              passengerCover: "0",
              isPrevPolicyExpiredBeforeNinetyDays: "0",
              prevNcbPercentage: "25",
              isPrevPolicyClaimed: "0",
              prevPolicyEndDate: "2022-08-27",
              prevInsurerId: "10",
              lpgCngKitValue: "0",
              kitType: "",
              isLpgCngKit: "0",
              dealerId: "101861",
              userId: "30197",
              versionId: "5453",
              manufactureDate: "2021-08-01",
              registrationDate: "2021-08-11",
              rtoCode: "MH01",
              isPACoverOwnerDriver: "1",
              isPaidDriver: "1",
              idv: "0",
              registrationNo: "",
              policyNo: "",
              isRenewal: "0",
              customerType: "I",
              vehicleCategory: "2",
              vehicleSubType: "",
              businessType: "Rollover",
              policyType: "comprehensive",
              mode: "ONLINE",
              medium: "POS",
              subSource: "POS",
              source: "UCD",
              apiKey: "GAADI123456",
              showCommissionScoreCard: true,
              leadId: "62f39437aa10000009",
            },
          },
        },
      },
    },
  })
  async getQuotesDependentScoreCard(
    @Req() req: ReqWithUser,
    @Res() res: Response
  ) {
    try {
      await this.authMiddleware.use(req, res);
      const userInfo = { ...req.userInfo };
      const quotesWithScores: any =
        await this.pointsManagementService.getScoreCardWithQuotes(
          req.body,
          userInfo
        );
      return sendResponse(req, res, 200, "ok", quotesWithScores);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in v2 score card API", {
        error,
        leadId: req.body.leadId || req.body.visit_id,
        product: req.body.product,
        vehicleType: req.body.vehicleCategory || req.body.vehicleType || null,
      });
      return sendResponse(
        req,
        res,
        err.status || 500,
        "error",
        error?.response || error
      );
    }
  }

  @Get("/view-score-card")
  @UserAuth()
  @ApiOperation({
    summary: "Return if user should be able to view score card",
    parameters: [
      {
        name: "dealerId",
        in: "query",
        description: "Dealer ID of user/selected user",
        example: "101861",
      },
      {
        name: "vehicleType",
        in: "query",
        description: "Vehicle type if LOB type is motor",
        example: "1",
      },
      {
        name: "product",
        in: "query",
        description:
          "LOB - motor/health/travel/life/pet/fire/specificMarine/workmenCompensation/professionalIndemnity/home",
        example: "motor",
      },
    ],
  })
  async shouldViewScoreCard(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      Logger.debug("should view score card controller", {
        query: req.query,
      });
      const reqBody = {
        ...req.body,
        dealerId: req.query.dealerId,
        vehicleType: req.query.vehicleType,
        product: req.query.product,
      };
      const { showScoreCard } =
        await this.pointsManagementService.checkScoreCardVisible(
          reqBody,
          true,
          req.userInfo
        );

      return sendResponse(req, res, 200, "ok", { showScoreCard });
    } catch (err) {
      Logger.error("error in view score card API", { err });
      return sendResponse(req, res, err?.response?.status || 500, "error", {
        err: err?.response || err,
      });
    }
  }

  @Post("/score-card-offline-quotes")
  @UserAuth()
  @ApiOperation({
    summary: "Return Score Card",
    requestBody: {
      description: "returns score card based on body provided",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              medium: "POS",
              domain: "motor",
              insurer: 1,
              vehicleType: 2,
              vehicleSubType: 9,
              caseType: 1,
              policyType: 2,
              modeOfPayment: "online",
              fuelType: "Petrol",
              make: 71,
              model: 3224,
              variant: 8343,
              vehicleCC: 1451,
              seatingCapacity: 5,
              bookingMode: "online",
              zeroOrNoDept: "No",
              isNcb: "No",
              vehicleUsageType: 2,
              ownerType: 2,
              registrationDate: "2021-11-11",
              manufacturingDate: "2021-01-01",
              rtoCode: "OD01",
              dealer_id: 711747,
              fourthYearRenewal: 0,
              isRenewal: 0,
            },
          },
        },
      },
    },
  })
  async getUserSpecificScoreChart(
    @Req() req: ReqWithUser,
    @Res() res: Response
  ) {
    Logger.debug("earn more score popup ", { body: req.body });
    const { showScoreCard, dealerDetails } =
      await this.pointsManagementService.checkScoreCardVisible(
        req.body,
        true,
        req.userInfo
      );
    const data = { showScoreCard, html: "" };
    if (!showScoreCard) {
      return sendResponse(req, res, 200, "ok", data);
    }
    const scoreChart = await this.pointsManagementService.calculateScoreDetails(
      req.body,
      dealerDetails,
      req.userInfo
    );
    const context = ContextHelper.getStore();

    const folderPath =
      context.get("medium") === process.env.APP_MEDIUM
        ? "/pwa/img"
        : "/public/b2c/zigwheels/img";
    const gcdWithTimeStamp = `${req.userInfo.gcd_code}_${moment()
      .add(5, "hours")
      .add(30, "minutes")
      .format("YYYY-MM-DD HH:mm")}`;
    const variables = {
      folderPath,
      scoreDetails: scoreChart.scoreDetails,
      policyType: req.body.policyType,
      gcdWithTimeStamp,
    };
    const filePath = path.join(
      __dirname,
      "../views/layouts/quotes/OfflineQuotesScorePopup.ejs"
    );
    const html = await ejs.renderFile(filePath, variables, {
      async: true,
    });
    data.html = html;
    data.showScoreCard = scoreChart.showScoreCard;
    return sendResponse(req, res, 200, "ok", data);
  }

  @Get("/lead-commission")
  @ApiOperation({
    summary: "Get Score from LMW for proposal page",
    parameters: [
      {
        name: "leadId",
        in: "query",
        description: "Lead ID",
        example: "63dcfc0520fd4364a5e569d9",
      },
      {
        name: "dealerId",
        in: "query",
        description: "Dealer ID of user/selected user",
        example: "101861",
      },
      {
        name: "vehicleType",
        in: "query",
        description: "Vehicle type if LOB type is motor",
        example: "1",
      },
      {
        name: "product",
        in: "query",
        description:
          "LOB - motor/health/travel/life/pet/fire/specificMarine/workmenCompensation/hospicash/professionalIndemnity/home",
        example: "motor",
      },
    ],
  })
  async getScoreForLeadFromLMW(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const isUserAuthenticated = await this.authMiddleware.use(req, res);
      const leadId = req.query.leadId as string;
      Logger.debug(
        "in get score for lead from lmw API, is user authenticated ",
        isUserAuthenticated
      );

      const product = req.query?.product as string;
      if (
        !isUserAuthenticated ||
        !leadId ||
        (product === "motor" && !req.query.vehicleCategory) ||
        !req.query.dealerId
      ) {
        const data = {
          commissionData: null,
          retry: false,
        };
        return sendResponse(req, res, 200, "ok", data);
      }

      const reqBody = {
        ...req.body,
        vehicleType: Number(req.query.vehicleCategory),
        dealerId: Number(req.query.dealerId),
        product,
      };
      const referDealerParams = {
        dealer_id: req.userInfo.refer_dealer_id,
      };
      const [{ showScoreCard, dealerDetails }, rapDetails] = await Promise.all([
        this.pointsManagementService.checkScoreCardVisible(
          reqBody,
          isUserAuthenticated,
          req.userInfo
        ),
        req.userInfo.refer_dealer_id &&
          this.dealerService.getDealerDetails(referDealerParams),
      ]);
      const mPosGCD = rapDetails?.length ? rapDetails[0].gcd_code : "";

      const channelType =
        ChannelPartnerTypes[dealerDetails?.[0]?.channel_partner_type];
      const channelSubType =
        channelType !== ChannelPartnerTypes.PARTNER
          ? Number(dealerDetails?.[0]?.channel_partner_sub_type)
          : undefined;
      const channelCity = dealerDetails?.[0]?.city_id;
      const channelName = dealerDetails?.[0]?.name;
      if (!showScoreCard) {
        const data = {
          commissionData: null,
          retry: false,
        };
        return sendResponse(req, res, 200, "ok", data);
      }

      const productBasedCommissionParamsMapping = {
        motor: {
          gcdCode: req.userInfo?.gcd_code,
          mPosGCD,
        },
        health: {
          visit_id: leadId,
          channelName,
          gcdCode: req.userInfo?.gcd_code,
          channelCity,
          channelType,
          channelSubType,
        },
        travel: {
          medium: "POS",
          gcdCode: req.userInfo?.gcd_code,
          channelCity,
          channelSubType,
        },
        pet: {
          medium: "POS",
          gcdCode: req.userInfo?.gcd_code,
          channelCity,
          channelSubType,
        },
        fire: {
          medium: "POS",
          gcdCode: req.userInfo?.gcd_code,
          channelCity,
          channelSubType,
        },
        specificMarine: {
          medium: "POS",
          gcdCode: req.userInfo?.gcd_code,
          channelCity,
          channelSubType,
        },
        workmenCompensation: {
          medium: "POS",
          gcdCode: req.userInfo?.gcd_code,
          channelCity,
          channelSubType,
        },
        professionalIndemnity: {
          medium: "POS",
          gcdCode: req.userInfo?.gcd_code,
          channelCity,
          channelSubType,
        },
        hospicash: {
          medium: "POS",
          gcdCode: req.userInfo?.gcd_code,
          channelCity,
          channelSubType,
        },
        home: {
          medium: "POS",
          gcdCode: req.userInfo?.gcd_code,
          channelCity,
          channelSubType,
        },
      };

      const productBasedCommissionDataMapping = {
        motor: async () =>
          this.motorProposalService.getCommission(
            leadId,
            productBasedCommissionParamsMapping.motor
          ),
        health: async () =>
          this.healthLeadService.getCommission(
            productBasedCommissionParamsMapping.health
          ),
        travel: async () =>
          this.travelProposalService.getCommission(
            leadId,
            productBasedCommissionParamsMapping.travel
          ),
        pet: async () =>
          this.petProposalService.getCommission(
            leadId,
            productBasedCommissionParamsMapping.pet
          ),
        fire: async () =>
          this.smeProposalService.getCommission(
            leadId,
            productBasedCommissionParamsMapping.fire,
            product
          ),
        specificMarine: async () =>
          this.smeProposalService.getCommission(
            leadId,
            productBasedCommissionParamsMapping.specificMarine,
            product
          ),
        workmenCompensation: async () =>
          this.smeProposalService.getCommission(
            leadId,
            productBasedCommissionParamsMapping.workmenCompensation,
            product
          ),
        professionalIndemnity: async () =>
          this.smeProposalService.getCommission(
            leadId,
            productBasedCommissionParamsMapping.professionalIndemnity,
            product
          ),
        home: async () =>
          this.smeProposalService.getCommission(
            leadId,
            productBasedCommissionParamsMapping.home,
            product
          ),
        hospicash: async () =>
          this.hospicashService.getCommission(
            leadId,
            productBasedCommissionParamsMapping.hospicash
          ),
      };
      const commissionData = await productBasedCommissionDataMapping[
        product
      ]?.();

      return sendResponse(req, res, 200, "ok", commissionData);
    } catch (err) {
      Logger.error("error in get score for lead from LMW", { err });
      return res
        .status(err?.response?.status || err.status || 500)
        .json({ message: err.stack || err?.response?.stack || err?.response });
    }
  }

  @Get("/header")
  @UserAuth()
  @ApiOperation({
    summary: "Get visibility of scores header based on config",
  })
  async shouldShowGridpointRedirectionHeader(@Req() req: any, @Res() res: any) {
    const userInfo = req.userInfo;
    try {
      const { showScoreHeader } =
        await this.pointsManagementService.checkScoreHeaderVisible(userInfo);
      return sendResponse(req, res, 200, "OK", { showScoreHeader });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in score header API", {
        error,
        leadId: req.body.leadId || req.body.visit_id,
        product: req.body.product,
        vehicleType: req.body.vehicleCategory || req.body.vehicleType || null,
      });
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || 500,
        "error",
        error?.response || error
      );
    }
  }
}
