import { Inject, Service } from "typedi";
import { logger } from "@/utils/logger";
import UploadHitProducer from "@/services/producers/upload-hit-producer";

@Service()
export default class UploadHitService {
  @Inject()
  private uploadHitProducer: UploadHitProducer;

  public async initiateParentHit(
    apiConfig: any,
    file: any,
    requestBody: any,
    headers: any
  ): Promise<any> {
    logger.debug("initiating parent hit");
    const { message } = await this.uploadHitProducer.produceParentHit(
      apiConfig,
      file,
      requestBody,
      headers
    );
    return message;
  }
}
