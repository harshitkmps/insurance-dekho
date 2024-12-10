import CommonApiHelper from "../../services/helpers/common-api-helper";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import ContextHelper from "../../services/helpers/context-helper";
@Injectable()
export default class DocumentService {
  constructor(public apiHelper: CommonApiHelper) {}

  public async addRegisterDocumentV2(
    headers: any,
    docIds: string | string[],
    sendAuth = true
  ) {
    try {
      let requestDocIds = [];
      if (Array.isArray(docIds)) {
        requestDocIds = [...docIds];
      } else {
        requestDocIds = [docIds];
      }

      const body = { doc_ids: requestDocIds };
      Logger.debug("registering document with following doc id(s)", {
        requestDocIds,
      });

      let newHeaders = {};
      if (sendAuth == true) {
        newHeaders = {
          Authorization: ContextHelper.getStore().get("authorization"),
        };
      }
      const options = {
        endpoint:
          process.env.DOC_SERVICE_URL + `doc-service/v2/documents/register`,
        method: "POST",
        config: {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.DOC_SERVICE_API_KEY,
            ...newHeaders,
          },
        },
      };
      const response = await this.apiHelper.postData(options, body);
      return response;
    } catch (error) {
      Logger.error("Error from doc service", { error });
      throw new HttpException("Error while registering document", 500);
    }
  }
}
