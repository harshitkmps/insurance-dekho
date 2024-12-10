import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import ConfigService from "./config-service";
import { config } from "../constants/config.constants";
import { UseCache } from "../decorators/use-cache.decorator";
import DocumentService from "../core/api-helpers/document-service";
import { Roles } from "../constants/roles.constants";

@Injectable()
export default class AgentProfilingService {
  constructor(
    private readonly apiHelper: CommonApiHelper,
    private readonly configService: ConfigService,
    private readonly documentService: DocumentService
  ) {}

  @UseCache({ expiryTimer: 86400 })
  public async fetchFieldValidationConfig(filters: Object): Promise<any> {
    Logger.debug("fetching field validation config with filters ", filters);
    try {
      filters["status"] = 1;
      const options = {
        endpoint: `${process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT_V2}/field-validation-config`,
      };
      const fieldValidationConfig: any = await this.apiHelper.fetchData(
        options,
        filters
      );
      return fieldValidationConfig.data;
    } catch (error) {
      throw new HttpException(
        "Some error occurred while fetching field validation config",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  public async fetchDealerProperties(filters: Object): Promise<any> {
    Logger.debug("fetching dealers properties with filters ", filters);
    try {
      filters["status"] = 1;
      const options = {
        endpoint: `${process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT_V2}/${filters["cps_id"]}`,
      };
      const cpsResponseData: any = await this.apiHelper.fetchData(
        options,
        filters
      );
      return cpsResponseData;
    } catch (error) {
      const data = [];
      return data;
    }
  }

  public async formatDealerProperties(data: any): Promise<any> {
    Logger.debug("Formatting dealer's data received from CPS ", data);
    const modifiedData = { ...data };
    const profilePictureDocId = data?.properties?.profile_photo_doc_id;
    if (profilePictureDocId) {
      const resFromDocService =
        await this.documentService.addRegisterDocumentV2(
          {},
          profilePictureDocId,
          false
        );
      const accessId = resFromDocService?.data?.docs?.[0]?.access_id;
      modifiedData.profilePhotoUrl =
        process.env.DOC_SERVICE_URL + `doc-service/v1/documents/` + accessId;
    }
    const cityId = data?.city_id;
    const city = await this.fetchCity(cityId);
    const cityName = city?.data?.[0]?.cityName;
    if (cityName) {
      modifiedData.city = cityName;
    }
    return modifiedData;
  }

  public async updateDealerProperties(
    body: any,
    params: Object,
    userInfo: any
  ): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT_V2}/${params["cps_id"]}`,
      };
      const modifiedBy = userInfo.uuid;
      const reqBody = {
        ...body,
        modified_by: modifiedBy,
      };
      const updatedDealerPropertiesResponse = await this.apiHelper.putData(
        options,
        reqBody
      );
      return updatedDealerPropertiesResponse;
    } catch (error) {
      const errorObj = error?.response ?? error;
      const customError = errorObj?.message?.response?.data?.errors || errorObj;
      throw new HttpException(customError, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
  public async fetchCity(city_id): Promise<any> {
    Logger.debug("inside fetch city from city id");
    try {
      const options = {
        endpoint: `${process.env.MASTER_DATA_ENDPOINT_URL}/city/${city_id}`,
      };
      const fetchedCity = await this.apiHelper.fetchData(options, {});
      return fetchedCity;
    } catch (error) {
      throw new HttpException(
        "Unable to fetch city",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
  public async fetchBasicDetailsSkeleton(): Promise<any> {
    try {
      const basicDealerDetailsSkeleton =
        await this.configService.getConfigValueByKey(
          config.DEALER_DETAILS_BASIC_SKELETON
        );
      return basicDealerDetailsSkeleton;
    } catch (error) {
      throw new HttpException(
        "Unable to fetch basic details skeleton for dealer",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
  public prepareConfig(userInfo: any) {
    const dealerSearchAllowedRoles = [
      ...Roles.POS_ADMIN_ALL,
      ...Roles.POS_SALES_ALL,
    ];
    const config = { displaySearchBox: false };
    if (dealerSearchAllowedRoles.includes(userInfo.pos_role_id)) {
      config.displaySearchBox = true;
    }
    return config;
  }
}
