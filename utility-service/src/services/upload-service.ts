import { Inject, Service } from "typedi";
import AWS from "aws-sdk";
import fs from "fs";
import { logger } from "@/utils/logger";
import UploadParentReq from "@/models/mongo/upload-parent-req.schema";
import { HttpException } from "@/exceptions/HttpException";
import CommonApiHelper from "./helpers/common-api-helper";

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
  signatureVersion: "v4",
});

@Service()
export default class UploadService {
  @Inject()
  private apiHelper: CommonApiHelper;

  public async uploadFileToS3(
    filePath: string,
    fileBuffer: any = null
  ): Promise<any> {
    const fileStream = fileBuffer ?? fs.createReadStream(filePath);
    const url = await s3
      .upload({
        Key: process.env.AWS_DIR + filePath,
        Body: fileStream,
        Bucket: process.env.BUCKET_NAME,
      })
      .promise();
    logger.info("file uploaded to aws", { filePath, url: url.Location });
    const newUrl = new URL(url.Location);
    const signedUrl = await this.getSignedDownloadURL(
      decodeURIComponent(newUrl.pathname.slice(1))
    );
    return { signedUrl, unsignedUrl: url.Location };
  }

  public async getSignedDownloadURL(filePath: string): Promise<string> {
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: filePath,
      Expires: 24 * 60 * 60,
    };
    const signedUrl = await s3.getSignedUrlPromise("getObject", params);
    logger.info("signed url link for file", { signedUrl });
    return signedUrl;
  }

  public async getParentReqLogByKey(key: string): Promise<any> {
    if (!key) {
      throw new HttpException(400, {
        success: false,
        message: "Key is null or undefined",
      });
    }
    const parentReqLog = await UploadParentReq.findOne(
      { "apiConfig.configKey": key },
      "status"
    );
    logger.info("got upload parent request log value for key ", { key });
    if (!parentReqLog) {
      return null;
    }
    return parentReqLog.status;
  }

  public async fetchStreamResponseFromS3(link: string): Promise<any> {
    const options = {
      endpoint: link,
    };
    const params = { responseType: "stream" };
    const res: any = await this.apiHelper.fetchData(options, params);
    return res.data;
  }
}
