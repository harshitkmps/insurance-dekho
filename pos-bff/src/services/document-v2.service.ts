import { Injectable } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "./helpers/cache/redis-cache-impl";

@Injectable()
export default class DocumentServiceV2 {
  constructor(
    private apiHelper: CommonApiHelper,
    private redisService: RedisService
  ) {}

  public async uploadDoc(file: Express.Multer.File, authToken: string) {
    const options = {
      endpoint: process.env.DOC_SERVICE_URL + `doc-service/v1/documents`,
      method: "POST",
      config: {
        maxContentLength: 100000000,
        maxBodyLength: 1000000000,
        headers: {
          Authorization: authToken,
          "x-api-key": process.env.DOC_SERVICE_API_KEY,
        },
      },
    };
    file.originalname = uuidv4() + "_" + file.originalname;
    const data = { document: file, doc_owner_uuid: "owner" };
    const response = await this.apiHelper.postData(options, data);
    return response;
  }

  public async generateOtt(bearerToken: string) {
    const uuid = uuidv4();
    const cacheKey = `__cacheKey__ott__${uuid}`;
    await this.redisService.setWithExpiry(cacheKey, 100, bearerToken);
    return uuid;
  }

  public async getTokenFromOtt(ott: string) {
    const cacheKey = `__cacheKey__ott__${ott}`;
    const token = await this.redisService.get(cacheKey);
    await this.redisService.resetCacheForKey(cacheKey);
    return token;
  }
}
