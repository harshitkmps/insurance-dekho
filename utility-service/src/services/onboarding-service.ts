import { logger } from "@/utils/logger";
import { Inject, Service } from "typedi";
import CommonApiHelper from "./helpers/common-api-helper";
import GcdDataProducer from "./producers/gcd-data-producer";
import { GST_CONSTANT } from "@/constants/gst.constants";
import CommunicationService from "./communication-service";
import UploadService from "./upload-service";
import { Container } from "typedi";
import CommonUtils from "@/utils/common-utils";
import fs from "fs";
import GstDetailsParentReq from "@/models/mongo/gst-details-parent-req.schema";
import { FileService } from "./file-service";
import _ from "lodash";

const communicationService = Container.get(CommunicationService);
const uploadService = Container.get(UploadService);
const fileService = Container.get(FileService);

@Service()
export default class OnboradingService {
  @Inject()
  private apiHelper: CommonApiHelper;
  @Inject()
  private gcdDataProducer: GcdDataProducer;

  public async fetchGSTDetails(): Promise<any> {
    logger.info("Inside onboarding service");
    const options = {
      endpoint: `${process.env.CPS_ENDPOINT}/cps/v2/channel-partners/gst-pan`,
    };
    const usersData: any = await this.apiHelper.fetchData(options, {});
    const users = usersData.data;
    if (users?.length) {
      for (const user of users) {
        await this.gcdDataProducer.produceGcdData(
          user.uuid,
          user.gcd_code,
          user.pan_card
        );
      }
    }
  }

  public async sendGSTDetails(body: any, sendMailDetails: any): Promise<any> {
    logger.info("Inside Send GST Details", body, sendMailDetails);
    const dayCount = body.dayCount ? body.dayCount : 1;
    const data = await GstDetailsParentReq.find({
      createdAt: { $gt: new Date(Date.now() - dayCount * 24 * 60 * 60 * 1000) },
      "response.iamUuid": { $exists: true },
    });
    let arr = [];
    for (const log of data) {
      arr = arr.concat(log.response);
    }
    if (arr.length) {
      const csvHeadings = {
        gcdCode: GST_CONSTANT.GCD_CODE,
        gstNumber: GST_CONSTANT.GST_NUMBER,
      };
      const csvArr = arr.map((data: any) => {
        const dataCsvKeys = {};

        for (const key in csvHeadings) {
          dataCsvKeys[csvHeadings[key]] = _.get(data, key);
        }
        return dataCsvKeys;
      });

      const { filePath, fileName } = await fileService.createFileAndHeadings(
        GST_CONSTANT.USER,
        GST_CONSTANT.GST_REPORT,
        csvHeadings,
        "csv"
      );
      const dataStringified = CommonUtils.convertToCSV(csvArr, csvHeadings);
      let finalData = "";
      finalData += dataStringified + "\n";
      await fs.promises.appendFile(filePath, finalData);

      const { signedUrl } = await uploadService.uploadFileToS3(filePath);
      if (fs.existsSync(filePath)) {
        fs.promises.unlink(filePath);
      }
      logger.info("files uploaded to s3");

      const params = {
        NUMBER_OF_PARTNERS: arr.length,
      };
      const emails = sendMailDetails.EMAILBCC;
      const bcc = {};
      for (const email of emails) {
        bcc[email] = "";
      }
      const body = {
        to: JSON.stringify({ [sendMailDetails.EMAILTO]: "" }),
        bcc: JSON.stringify(bcc),
        template_name: sendMailDetails.EMAIL_TEMPLATE,
        reference_type: sendMailDetails.REFERENCE_TYPE,
        reference_id: sendMailDetails.REFERENCE_ID,
        template_variable: JSON.stringify(params),
        subject_variable: JSON.stringify(params),
        attachment_path: { [fileName]: signedUrl },
        custom_attachment_name: 1,
      };
      const res = await communicationService.sendEmail(body);
      logger.debug("Mail send", res);
    }
  }
}
