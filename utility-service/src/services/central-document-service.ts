import { logger } from "@/utils/logger";
import { Inject, Service } from "typedi";
import CommonApiHelper from "./helpers/common-api-helper";
@Service()
export default class CentralDocumentService {
  @Inject()
  private apiHelper: CommonApiHelper;

  public async generatePDF(body: any) {
    try {
      const options = {
        endpoint: `${process.env.BROKERAGE_CENTRAL_SERVICE_ENDPOINT}/utilities/v1/pdf/generate`,
        config: {
          headers: {
            "x-api-key": process.env.BROKERAGE_CENTRAL_SERVICE_API_KEY,
          },
        },
      };
      const res = await this.apiHelper.postData(options, body);
      logger.info("Generate pdf response", { body, res });
      return res;
    } catch (err) {
      logger.error("error in send mail API", { err });
      return err;
    }
  }

  public async registerDoc(body: any) {
    try {
      const options = {
        endpoint: `${process.env.DOCUMENT_SERVICE_ENDPOINT}/v1/documents/register`,
        config: {
          headers: {
            "x-api-key": process.env.DOC_SERVICE_API_KEY,
            Cookie: process.env.DOCUMENT_SERVICE_AUTH_KEY,
          },
        },
      };

      const res = await this.apiHelper.postData(options, body);
      logger.info("Document Id register response ", { body, res });
      return res;
    } catch (err) {
      logger.error("error in send mail API", { err });
      return err;
    }
  }
}
