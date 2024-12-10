import DealerService from "../services/dealer-service";
import { RenderSchema } from "../config/render-schema";
import { Controller, Get, Req, Res, Logger } from "@nestjs/common";
import ViewUtils from "../utils/view-utils";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { MAP_PRODUCT_TYPE_WITH_IDTREE_TEAM } from "../constants/config.constants";
import CommonApiHelper from "../services/helpers/common-api-helper";
import { ApiTags } from "@nestjs/swagger";

@Controller("/v1/forms")
@ApiTags("Form Builder")
export class FormBuilderController {
  private authMiddleware: AuthMiddleware;

  constructor(
    private dealerService: DealerService,
    private apiHelper: CommonApiHelper
  ) {
    this.authMiddleware = new AuthMiddleware(this.apiHelper);
  }

  @Get("/:id") ///pet/PersonalDetails
  async renderSchema(@Req() request: any, @Res() response: any) {
    await this.authMiddleware.use(request, response);
    const productType = request.query.productType;
    const idTreeTeam = MAP_PRODUCT_TYPE_WITH_IDTREE_TEAM[productType];
    const renderSchemaMap = RenderSchema[request.params.id];
    response.setHeader("content-type", "application/javascript");
    let apiBffUrl = "";
    let docServiceUrl = "";
    let schemaVal = [];
    let posUiUrl = "";
    let posappUiUrl = "";
    if (
      renderSchemaMap.mapper == "pet-lead-form" ||
      renderSchemaMap.mapper == "travel-lead-form" ||
      renderSchemaMap.mapper == "fire-lead-form" ||
      renderSchemaMap.mapper == "fire-lead-step-1" ||
      renderSchemaMap.mapper == "specificMarine-basic-details" ||
      renderSchemaMap.mapper == "workmenCompensation-lead-form" ||
      renderSchemaMap.mapper == "professionalIndemnity-basic-details"
    ) {
      posUiUrl = process.env.POS_UI_ENDPOINT;
      schemaVal = await this.getCityData(request, idTreeTeam);
    }
    if (renderSchemaMap.mapper == "personal-accident-lead-form") {
      posappUiUrl = process.env.POSAPP_UI_ENDPOINT;
      posUiUrl = process.env.POS_UI_ENDPOINT;
      schemaVal = await this.getCityData(request, idTreeTeam);
    }

    if (
      renderSchemaMap.mapper == "pet-proposal-step-2" ||
      renderSchemaMap.mapper === "personal-accident-proposal-step-1" ||
      renderSchemaMap.mapper === "personal-accident-proposal-step-2" ||
      renderSchemaMap.mapper === "personal-accident-proposal-step-3" ||
      renderSchemaMap.mapper === "hospicash-proposal-step-1"
    ) {
      apiBffUrl = process.env.API_BFF_URL;
      docServiceUrl = process.env.DOC_SERVICE_URL;
    }
    if (renderSchemaMap.mapper == "personal-details") {
      schemaVal = await this.getCityData(request, idTreeTeam);
    }
    if (renderSchemaMap.mapper == "fire-offline" || "other-than-FnB") {
      posUiUrl = process.env.POS_UI_ENDPOINT;
      apiBffUrl = process.env.API_BFF_URL;
      docServiceUrl = process.env.DOC_SERVICE_URL;
      schemaVal = await this.getCityData(request, idTreeTeam);
    }
    response.render(renderSchemaMap.schemaName, {
      schemaVal: schemaVal ? schemaVal : [],
      nameEnabled: true,
      apiBffUrl: apiBffUrl ? apiBffUrl : "",
      docServiceUrl: docServiceUrl ? docServiceUrl : "",
      posUiUrl: posUiUrl ? posUiUrl : "",
      posappUiUrl: posappUiUrl ? posappUiUrl : "",
    });
  }

  @Get("/investment/:id") //Investment
  async renderSchemaInvestment(@Req() request: any, @Res() response: any) {
    const renderSchemaMap = RenderSchema[request.params.id];
    await this.authMiddleware.use(request, response);
    const productType = request.query.productType;
    const idTreeTeam = MAP_PRODUCT_TYPE_WITH_IDTREE_TEAM[productType];
    Logger.debug(
      "=================================render Schema",
      renderSchemaMap
    );
    response.setHeader("content-type", "application/javascript");
    let schemaVal = [];
    let posUiUrl = "";
    if (renderSchemaMap.mapper == "investment-lead-form") {
      posUiUrl = process.env.POS_UI_ENDPOINT;
      schemaVal = await this.getCityData(request, idTreeTeam);
    }
    if (renderSchemaMap.mapper == "personal-details") {
      schemaVal = await this.getCityData(request, idTreeTeam);
    }
    response.render(renderSchemaMap.schemaName, {
      schemaVal: schemaVal ? schemaVal : [],
      nameEnabled: true,
      posUiUrl: posUiUrl ? posUiUrl : "",
    });
  }

  async getCityData(request, product): Promise<any> {
    let filters = {};
    let cityData: any = [];
    let posUserRoleList: any = process.env.POS_INTERNAL_USER_ROLE_LIST;
    posUserRoleList = posUserRoleList.split(",");
    const userInfo = request.userInfo;
    const teams = userInfo?.teams;
    const teamUuid = teams?.[product]?.teamUuid;
    let fetchCities = true;

    if (["1", "2", "5"].indexOf(request.query.role_id) !== -1) {
      cityData = await this.dealerService.getCityByDealer({});
    } else {
      if (product) {
        if (teams && !teamUuid) {
          Logger.debug(
            `Sales user ${userInfo?.uuid} doesnt have a team assigned for product ${product}`
          );
          cityData = [];
          fetchCities = false;
        }
      }
      if (fetchCities) {
        filters = {
          getCitiesByReportingManager: "true",
          projection: "city_id,name",
          onboarded_on_general: "true",
          reporting_sfa_uuids: request.query.iam_uuid,
          team_uuids: teamUuid,
          getHierarchyUsers: "true",
        };
        cityData = await this.dealerService.getDealers(filters);
      }
    }
    const showDealerDropDown = ViewUtils.showDropDown(request.query.role_id);
    const isAssistanceEligible = request.query?.isAssistanceEligible === "true";
    const schemaRenderVal = {
      uuid: request.query.iam_uuid,
      roleId: request.query.role_id,
      source: request.query.source,
      gcd_code: userInfo?.gcd_code,
      subSource: request.query.subSource,
      medium: request.query.medium,
      productType: request.query.productType,
      dealerId: request.query.dealerId,
      dealerCityData:
        cityData && cityData.data
          ? JSON.stringify(cityData.data)
          : JSON.stringify([]),
      brokerageUrl: process.env.BROKERAGE_MASTER_LIST,
      posUserRoleList: JSON.stringify(posUserRoleList),
      creatorType: request.query.creatorType,
      isAssistanceEligible: isAssistanceEligible,
      guestUuid: request.query.guestUuid,
      showDealerDropDown,
    };
    return schemaRenderVal;
  }
}
