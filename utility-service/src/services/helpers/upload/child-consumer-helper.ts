import { Service, Inject } from "typedi";
import { logger } from "@/utils/logger";
import CommonApiHelper from "../common-api-helper";
import UploadChildReq from "@/models/mongo/upload-child-req.schema";
import { CHILD_API_STATUS } from "@/constants/upload.constants";
import _ from "lodash";
import ConsumerHelper from "./consumer-helper";
import CommonUtils from "@/utils/common-utils";

@Service()
export default class ChildConsumerHelper {
  @Inject()
  private apiHelper: CommonApiHelper;
  @Inject()
  private consumerHelper: ConsumerHelper;
  public async fetchDataFromExternalService(params: any, options: any) {
    try {
      const data: any = await this.apiHelper.getData(options, params);
      return { response: data, error: null };
    } catch (error) {
      logger.error("error in upload child consumer", { error });
      return { response: null, error };
    }
  }

  private async dataModificationLayer(
    response: any,
    config: any,
    sheetName: string
  ) {
    try {
      const dataModificationConfig = this.consumerHelper.generateConfigsByKey(
        config,
        sheetName,
        "output.valuesModification"
      );
      if (!Object.keys(dataModificationConfig)) {
        return response;
      }
      const values = response?.length ? response : [response];
      values.forEach((value: any) => {
        this.consumerHelper.transformValues(value, dataModificationConfig);
      });
    } catch (error) {
      logger.error("error in data transformation in upload child consumer", {
        error,
      });
      return response;
    }
  }

  public async handleMessageSuccess(message: any, rawResponse: any) {
    try {
      const { id, hitCount, config, sheetName } = message;
      const responseKey = config?.defaultConfig?.output?.response;
      const response = _.get(rawResponse, responseKey);
      await this.dataModificationLayer(response, config, sheetName);
      const updatedMessage = {
        hitCount: hitCount + 1,
        apiResponse: response,
        status: CHILD_API_STATUS.COMPLETED,
      };
      await UploadChildReq.findByIdAndUpdate(id, updatedMessage);
    } catch (error) {
      const err = CommonUtils.isJsonString(error);
      logger.error("error in handleMessageSuccess of upload child consumer", {
        err,
      });
    }
  }
}
