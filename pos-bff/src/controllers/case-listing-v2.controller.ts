import { sendResponse } from "../services/helpers/response-handler";
import ContextHelper from "../services/helpers/context-helper";
import { Request, Response } from "express";
import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Logger,
  HttpStatus,
  Body,
  Query,
} from "@nestjs/common";
import CaseListingService from "../services/case-listing-v2-service";
import { PosRoles, SalesRoles } from "../constants/pos-roles.constants";
import UtilityService from "../services/utility-service";
import CommonUtils from "../utils/common-utils";
import DateTimeUtils from "../utils/date-time-utils";
import { LeadMiddlewareService } from "../core/api-helpers/lead-middleware.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import {
  CaseListingDownloadConfigKeys,
  CaseListingDownloadTransformData,
} from "../constants/case-listing.constants";
import { CaseListingAuth } from "../decorators/case-listing.decorator";
import ApiPosService from "../services/apipos-service";
import { GetPolicyDocLinkQueryDto } from "../dtos/caselisting/renewals.dto";

@Controller("/v2")
@ApiTags("Case Listing v2")
export class CaseListingControllerV2 {
  constructor(
    private caseListingService: CaseListingService,
    private utilityService: UtilityService,
    private leadMiddlewareService: LeadMiddlewareService,
    private apiposService: ApiPosService
  ) {}

  @Get("/case-listing-skeleton")
  @ApiOperation({
    summary: "Returns config of case listing new Repo",
  })
  @CaseListingAuth()
  @UserAuth()
  async caseListingSkeleton(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const userInfo = req.userInfo;
      const referrer = req.get("referer");
      const listType = req.query?.listType;
      let products = [];

      products = await this.caseListingService.fetchProducts(
        userInfo,
        products,
        listType,
        referrer
      );
      await this.caseListingService.fetchFilters(products, listType);
      await this.caseListingService.fetchProductsBaseUrl(products);

      return sendResponse(req, res, 200, "ok", products);
    } catch (err) {
      Logger.error("error in case listing skeleton API", err);
      return res
        .status(500)
        .json({ error: err?.response || err, success: false });
    }
  }

  @Post("/case-listing")
  @CaseListingAuth()
  @UserAuth()
  @ApiOperation({
    summary: "Returns case listing data from LMW",
    requestBody: {
      description: "returns cases detail from LMW",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              filters: {
                createdDateRange: {
                  startDate: "2023-01-27",
                  endDate: "2023-02-03",
                },
                searchValue: "",
                vehicleType: "0",
                bucket: "issued",
                policyNumber: "",
                policyMedium: "online",
                isRAP: 0,
              },
              limit: 12,
              productType: "Motor",
            },
          },
        },
      },
    },
  })
  async getCaseListing(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const body = req.body;
      let transformResponse = true,
        getList = true;
      if (body.hasOwnProperty("getList")) {
        getList = body?.getList;
      }
      if (body.hasOwnProperty("transformResponse")) {
        transformResponse = body?.transformResponse;
      }
      const host = ContextHelper.getStore().get("host");
      const medium = ContextHelper.getStore().get("medium");
      Logger.debug("host and medium of case listing ", {
        HOST: host,
        medium: medium,
      });
      await this.caseListingService.prepareCaseListingReqData(
        body,
        req.userInfo
      );

      const caseListingData =
        await this.caseListingService.getCaseListingLeadsAndCount(body, medium);

      if (getList && transformResponse) {
        const transformedCases =
          await this.caseListingService.getCaseListingData(
            caseListingData.data,
            body,
            req.userInfo,
            medium,
            body.filters.bucket
          );
        caseListingData.data = transformedCases?.data;
        caseListingData.configData = transformedCases?.configData;
      }
      return sendResponse(req, res, 200, "ok", {
        data: caseListingData?.data,
        config: caseListingData?.configData,
        pagination: caseListingData?.pagination,
        casesCount: caseListingData?.casesCount,
      });
    } catch (err) {
      Logger.error("error in case listing POST API", err);
      return sendResponse(
        req,
        res,
        err?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "ok",
        {
          data: [],
          pagination: {},
          casesCount: {},
        }
      );
    }
  }

  @Get("/case-listing-link")
  @UserAuth()
  async getCaseListingLink(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const body = req.body;
      Logger.debug("headers of case listing link request", req.headers);
      const host = ContextHelper.getStore().get("host");
      const medium = ContextHelper.getStore().get("medium");
      Logger.debug("host and medium", { host, medium });
      const link = await this.caseListingService.generateCaseListingLink(
        body,
        req.userInfo,
        medium
      );
      return sendResponse(req, res, 200, "ok", link);
    } catch (error) {
      Logger.error("error in get case listing url", { error });
      return sendResponse(
        req,
        res,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "unable to fetch the link",
        {}
      );
    }
  }

  @Post("/download-report")
  @UserAuth()
  @ApiOperation({
    summary: "Triggers download API of Utility Service",
    requestBody: {
      description: "Triggers download API of Utility Service",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              filters: {
                createdDateRange: {
                  startDate: "2023-01-27",
                  endDate: "2023-02-03",
                },
                searchValue: "",
                vehicleType: "0",
                bucket: "issued",
                policyNumber: "",
                policyMedium: "online",
                isRAP: 0,
              },
              limit: 12,
              productType: "Motor",
            },
          },
        },
      },
    },
  })
  async downloadReport(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const headers = {
        authorization: req.headers.authorization,
      };
      const medium = ContextHelper.getStore().get("medium");
      const requestSource = medium;

      const name = req.userInfo.first_name;
      const email = req.userInfo.email;
      const uuid = req.userInfo.uuid;
      const endpoint = `api/v2/case-listing`;
      delete req.body.requestSource;

      const lob =
        req.body.productType === "Card" ? "Credit card" : req.body.productType;
      req.body["getCount"] = false;
      req.body["transformResponse"] =
        CaseListingDownloadTransformData[lob.toLowerCase()];
      // req.body["projections"] = ["salesHierarchy"];
      const downloadRes = await this.utilityService.downloadData(
        CaseListingDownloadConfigKeys[req.body.productType?.toLowerCase()],
        req.body,
        headers,
        requestSource,
        name,
        email,
        uuid,
        endpoint,
        lob
      );
      return sendResponse(req, res, 200, "ok", downloadRes);
    } catch (err) {
      Logger.error("error in download service", err);
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "unable to download the report",
        {}
      );
    }
  }

  @Post("/premium")
  @CaseListingAuth()
  @UserAuth()
  @ApiOperation({
    summary: "Get aggregate premium (product specific) from LMW",
    requestBody: {
      description:
        "Get aggregate premium (product specific) from LMW based on filters",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              filters: {
                createdDateRange: {
                  startDate: "2023-01-27",
                  endDate: "2023-02-03",
                },
                searchValue: "",
                vehicleType: "0",
                bucket: "issued",
                policyNumber: "",
                policyMedium: "online",
                isRAP: 0,
              },
              limit: 12,
              productType: "Motor",
            },
          },
        },
      },
    },
  })
  async getPremium(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const body = req.body;
      const host = ContextHelper.getStore().get("host");
      const medium = ContextHelper.getStore().get("medium");
      Logger.debug("host and medium of case listing ", {
        HOST: host,
        medium: medium,
      });
      await this.caseListingService.prepareCaseListingReqData(
        body,
        req.userInfo
      );
      const data = await this.caseListingService.getPremiumCount(body, medium);
      return sendResponse(req, res, 200, "ok", data);
    } catch (error) {
      Logger.debug(`error in get Premium api`, error);
      return sendResponse(
        req,
        res,
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "error",
        error?.response || "Something went wrong"
      );
    }
  }

  @Post("/download-notice")
  @UserAuth()
  @ApiOperation({
    summary: "Returns Renewal Notice link from LMW",
  })
  async getRenewalNotice(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body;
      Logger.debug("Renewal Notice req body", { body });
      const host = ContextHelper.getStore().get("host");
      const medium = ContextHelper.getStore().get("medium");
      Logger.debug("host and medium in Renewal Notice download req", {
        HOST: host,
        medium,
      });

      const downloadRes =
        await this.leadMiddlewareService.downloadRenewalNotice(body);
      return sendResponse(req, res, 200, "ok", downloadRes);
    } catch (err) {
      Logger.error("error while downloading Renewal Notice", err);
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "unable to download the Renewal Notice",
        {}
      );
    }
  }

  @Get("/cases-update")
  @UserAuth()
  @ApiOperation({
    summary: "Returns cases update data from LMW",
  })
  async getCasesUpdate(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const body = req.body;
      const today = new Date();
      body.filters = {
        createdDateRange: {
          startDate: DateTimeUtils.getDate(-7, today),
          endDate: today.toISOString().split("T")[0],
        },
        isRAP: !req.userInfo.tenant_id || req.userInfo.tenant_id === 1 ? 0 : 1,
      };
      Logger.debug("case update req body", { body });
      const host = ContextHelper.getStore().get("host");
      const medium = ContextHelper.getStore().get("medium");
      Logger.debug("host and medium of cases update", {
        HOST: host,
        medium,
      });
      await this.caseListingService.prepareCaseListingReqData(
        body,
        req.userInfo
      );

      const { cases } = await this.caseListingService.getCasesUpdate(
        body,
        req.userInfo,
        medium
      );
      return sendResponse(req, res, 200, "ok", {
        cases,
      });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in dashboard banners API", {
        error,
        leadId: req.body.leadId || req.body.visit_id,
        product: req.body.product,
        vehicleType: req.body.vehicleCategory || req.body.vehicleType || null,
      });
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "error",
        error?.response || error
      );
    }
  }

  @Post("/renewals/fomo-data")
  @UserAuth(
    PosRoles.SuperAdmin,
    PosRoles.Agent,
    PosRoles.SubAgent,
    ...SalesRoles
  )
  async getFomoPremiumData(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const body = req.body;
      const medium = ContextHelper.getStore().get("medium");
      await this.caseListingService.prepareCaseListingReqData(
        body,
        req.userInfo
      );

      const fomoData = await this.caseListingService.getFomoPremiumData(
        body,
        medium
      );
      return sendResponse(req, res, 200, "ok", {
        fomoData,
      });
    } catch (err) {
      Logger.error("error in fomo API", err);
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "unable to get data for fomo cards",
        {}
      );
    }
  }

  @Get("/renewals/case-listing/action-link")
  @UserAuth()
  @ApiOperation({
    summary: "Returns Renewals Action Link from Renewal Service",
  })
  async getRenewalsActionLink(@Req() req: Request, @Res() res: Response) {
    try {
      const query = req?.query;
      const renewalsActionLinkData =
        await this.caseListingService.getRenewalsCaseListingActionLink(query);
      return sendResponse(req, res, 200, "ok", {
        renewalsActionLinkData,
      });
    } catch (err) {
      Logger.error("error in renewals action link api", err);
      return sendResponse(
        req,
        res,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "unable to fetch the action link",
        {}
      );
    }
  }

  @Get("/policy-doc")
  @UserAuth()
  @ApiOperation({
    summary: "Returns Policy Doc Link from LMW",
  })
  async getPolicyDocLink(
    @Req() req: Request,
    @Res() res: Response,
    @Query() queryParams: GetPolicyDocLinkQueryDto
  ) {
    try {
      const query = queryParams;
      const policyDocLinkResponse =
        await this.caseListingService.getPolicyDocLink(query);
      return sendResponse(req, res, 200, "ok", policyDocLinkResponse);
    } catch (err) {
      Logger.error("error in policy doc link api", err);
      return sendResponse(
        req,
        res,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "unable to fetch the policy doc link",
        {}
      );
    }
  }

  @Post("/renewal/download-report")
  @UserAuth()
  @ApiOperation({
    summary: "Triggers renewal download API of Utility Service",
    requestBody: {
      description: "Triggers renewal download API of Utility Service",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              filters: {
                policyExpiryDateRange: {
                  startDate: "2024-09-30",
                  endDate: "2024-11-29",
                },
                leadsExpiryDateRange: {
                  startDate: "2024-09-23",
                  endDate: "2024-09-30",
                },
                searchValue: "",
                previousPolicyType: "All",
                bucket: "upcoming",
                previousPolicyNumber: "",
                policyMedium: "all",
                isRAP: 0,
                isGuest: 0,
                insurerId: 28,
              },
              limit: 12,
              productType: "Motor",
            },
          },
        },
      },
    },
  })
  async renewalDownloadReport(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const headers = {
        authorization: req.headers.authorization,
      };
      const medium = ContextHelper.getStore().get("medium");
      const requestSource = medium;

      const name = req?.userInfo?.first_name;
      const email = req?.userInfo?.email;
      const uuid = req?.userInfo?.uuid;
      const endpoint = `api/v2/case-listing`;
      delete req.body.requestSource;
      req.body["getCount"] = false;
      req.body["transformResponse"] = false;
      const downloadRes = await this.utilityService.downloadData(
        "renewalCases",
        req.body,
        headers,
        requestSource,
        name,
        email,
        uuid,
        endpoint
      );
      return sendResponse(req, res, 200, "ok", downloadRes);
    } catch (err) {
      Logger.error("error in download service", err);
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "unable to download the renewal report",
        {}
      );
    }
  }
}
