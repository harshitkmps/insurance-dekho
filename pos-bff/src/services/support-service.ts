import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { UseCache } from "../decorators/use-cache.decorator";
import ApiPosService from "./apipos-service";
import CommonUtils from "../utils/common-utils";
import {
  ENDORSEMENT_DONE_STATUS,
  ENDORSEMENT_TICKETS_FETCH_TIMEOUT,
  ENDORSEMENT_VISIBILITY_TIME_IN_DAYS,
  SUPPORT_CREDENTIALS_VALIDATE_TIMEOUT,
  SUPPORT_LOGIN_CREDENTIALS_CACHE_TIMEOUT,
  TicketType,
} from "../constants/support.constants";
import ConfigService from "./config-service";
import {
  config,
  LOGIN_SUPPORT_CREDENTIAL_CACHE_KEY,
} from "../constants/config.constants";

@Injectable()
export default class SupportService {
  constructor(
    private apiHelper: CommonApiHelper,
    private apiPosService: ApiPosService,
    private configService: ConfigService
  ) {}

  @UseCache({ expiryTimer: SUPPORT_LOGIN_CREDENTIALS_CACHE_TIMEOUT })
  public async loginUserToSupport(authToken: String): Promise<any> {
    Logger.debug("logging in user to support ");
    try {
      const params = { auth_token: authToken };
      const supportData = await this.apiPosService.checkLoginSupportAuth(
        params
      );
      return supportData;
    } catch (error) {
      Logger.error("Error while logging in user to support", { error });
      throw error;
    }
  }
  public async validateAndReloginUserToSupport(
    headers,
    userInfo
  ): Promise<any> {
    Logger.debug("Checking if cached data credentials are valid are not");
    const isCachedSupportLoginCredentialsValid =
      await this.validateSupportLoginCredentials(headers);

    if (!isCachedSupportLoginCredentialsValid) {
      Logger.debug("relogin user to support");
      const supportData = await this.reloginUserToSupport(userInfo.auth_token);
      headers["x-auth-id"] = supportData.user_id;
      headers["x-auth-token"] = supportData.auth_token;
      return supportData;
    }
    return null;
  }
  public async fetchTickets(params: Object, headers: Object): Promise<any> {
    try {
      const options = {
        endpoint: process.env.SUPPORT_API_URL + `/api/ticket/get`,
        method: "GET",
        config: {
          headers,
          timeout: ENDORSEMENT_TICKETS_FETCH_TIMEOUT,
        },
      };
      const response = await this.apiHelper.fetchData(options, params);
      return response["data"];
    } catch (error) {
      Logger.error("Error from support Api", { error });
      throw new HttpException(
        "Error while fetching data from support api",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getEndorsementTicketsForMotor(
    params: Object,
    headers: Object,
    userCredentialsForSupportLogin: any
  ): Promise<any> {
    let endorsementsForMotor = [];

    try {
      const queryParams = {
        isLazyLoad: Number(params["isLazyLoad"]),
        filters: JSON.stringify({
          search: "",
          ticketType: TicketType.ENDORSEMENT,
        }),
        page: Number(params["page"]),
      };
      Logger.debug(
        `fetching endorsements with params ${JSON.stringify(queryParams)}`
      );

      endorsementsForMotor = await this.fetchTickets(params, headers);
      const mappedEndorsementTicketsForMotor = this.mapMotorEndorsements(
        endorsementsForMotor,
        userCredentialsForSupportLogin
      );
      const response = {
        tickets: mappedEndorsementTicketsForMotor,
      };

      return response;
    } catch (error) {
      Logger.error("Error while fetching endorsement tickets for motor", {
        error,
      });
      const data = [];
      return data;
    }
  }

  public checkValidEndorsement(endorsement: Object) {
    if (endorsement["statusId"] === ENDORSEMENT_DONE_STATUS) {
      const closedOn: any = new Date(endorsement["updatedOn"]);
      const currentDate: any = new Date();
      const diffTime: any = Math.abs(currentDate - closedOn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > ENDORSEMENT_VISIBILITY_TIME_IN_DAYS ? false : true;
    }
    return true;
  }

  public mapMotorEndorsements(
    endorseMents: Array<Object>,
    userCredentialsForSupportLogin: any
  ) {
    Logger.debug("mapping fetched endorsements", endorseMents);

    const mappedEndorsements = [];

    endorseMents.forEach((endorsement) => {
      const checkValidEndorsement = this.checkValidEndorsement(endorsement);

      if (checkValidEndorsement) {
        mappedEndorsements.push({
          caseType: endorsement["caseType"],
          createdAt: endorsement["updatedOn"] || endorsement["raisedOn"],
          heading: endorsement["regNo"],
          subHeading2: endorsement["customerName"]
            ? `Owner: ${CommonUtils.capitalizeFirstLetterOfEachWord(
                endorsement["customerName"],
                " "
              )}`
            : "",
          creatorName: endorsement["createdByName"],
          insurerName: endorsement["insurer_trim_name"],
          insurerLogo: endorsement["insurer_logo"],
          subStatus: endorsement["status"],
          endorsementTicketId: endorsement["ticketId"],
          actionLink: `${process.env.SUPPORT_BASE_URL}/login?userId=${userCredentialsForSupportLogin.user_id}&authToken=${userCredentialsForSupportLogin.auth_token}&redirectTo=/endorsement/detail/${endorsement["ticketId"]}`,
          actionName: "View ticket",
          isEndorsementTicket: true,
        });
      }
    });

    return mappedEndorsements;
  }

  public async validateSupportLoginCredentials(headers: any): Promise<any> {
    try {
      const options = {
        endpoint: process.env.SUPPORT_API_URL,
        method: "GET",
        config: {
          headers,
          timeout: SUPPORT_CREDENTIALS_VALIDATE_TIMEOUT,
        },
      };
      const loginCredentialsValidCheck: any = await this.apiHelper.fetchData(
        options,
        {}
      );
      if (loginCredentialsValidCheck?.code === 403) {
        return false;
      }
      return true;
    } catch (error) {
      Logger.error("Error while validating support credentials", { error });
      throw new HttpException(
        "Error while validating support credentials",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async reloginUserToSupport(authToken: String): Promise<any> {
    Logger.debug("Invalid cached support login credentials");
    const { cacheCleared } = await this.configService.clearCache(
      `${LOGIN_SUPPORT_CREDENTIAL_CACHE_KEY}${authToken}`,
      true
    );
    if (cacheCleared) {
      const userCredentialsForSupportLogin = await this.loginUserToSupport(
        authToken
      );
      return userCredentialsForSupportLogin;
    }
  }

  public async checkEndorsementListingEligibility(userInfo: any): Promise<any> {
    const homepageConfig = await this.configService.getConfigValueByKey(
      config.HOMEPAGE_POST_LOGIN
    );
    const endorsementConfig = homepageConfig?.endorsement;
    const isEndorsementTicketsEnabledForUser =
      endorsementConfig?.enabled &&
      this.configService.checkConditions(
        endorsementConfig?.conditions,
        userInfo
      );
    return isEndorsementTicketsEnabledForUser;
  }
}
