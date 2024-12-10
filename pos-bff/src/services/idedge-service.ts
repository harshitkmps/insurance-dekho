import axios from "axios";
import { config } from "../constants/config.constants";
import ConfigService from "./config-service";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

@Injectable()
export default class IdedgeService {
  constructor(private configService: ConfigService) {}

  public async getUpdatedChunks(request: any): Promise<any> {
    const commitHashParams = request?.query?.commitHash;
    if (!commitHashParams) {
      throw new HttpException(
        `Commithash hasn't been provided`,
        HttpStatus.BAD_REQUEST
      );
    }

    const result = {
      useCache: true,
      chunkFiles: {},
      commitHash: commitHashParams,
    };

    const commitHashData = await this.getChunksFileData("gitCommitHash");
    if (commitHashData?.gitCommitHash !== commitHashParams) {
      const productType = request?.query?.productType;
      if (productType) {
        const productWiseConfig = await this.configService.getConfigValueByKey(
          config.PRODUCT_WISE_CHUNKS
        );
        const selectedKeys = productWiseConfig?.[productType]?.chunkFiles;

        if (selectedKeys) {
          const chunkHashData = await this.getChunksFileData("manifest");

          for (const key of selectedKeys) {
            if (chunkHashData[key]) {
              result.chunkFiles[key] = chunkHashData[key];
            }
          }
        }
      }
    }

    result.useCache = false;
    result.commitHash = commitHashData?.gitCommitHash;
    return result;
  }

  public async getChunksFileData(key: any): Promise<any> {
    let bundlePath = "";
    if (key === "gitCommitHash") {
      bundlePath =
        process.env.POS_APP_URL + `/pwa/js/bundle/gitCommitHash.json`;
    } else if (key === "manifest") {
      bundlePath = process.env.POS_APP_URL + `/pwa/js/bundle/manifest.json`;
    }
    try {
      const response = await axios.get(bundlePath);
      const cacheData = response?.data;
      return cacheData;
    } catch (error) {
      Logger.error("Error reading JSON from remote URL:", { error });
    }
  }
  public async getResources(request: any): Promise<any> {
    const result = {
      logos: {},
      fonts: {},
    };
    const resourceType = request?.query?.resourceType;
    const baseUrl = process.env.POS_APP_URL;
    if (resourceType == "logos") {
      const insurerLogos = await this.configService.getConfigValueByKey(
        config.INSURER_WISE_LOGOS
      );
      const logoUrls = insurerLogos.map(
        (logoName: string) => baseUrl + "/pwa/img/insurer/logo/" + logoName
      );
      result.logos = logoUrls;
    }
    if (resourceType == "fonts") {
      const fontsName = [
        "cd-fonts.eot",
        "cd-fonts.ttf",
        "cd-fonts.woff",
        "ins-font.eot",
        "ins-font.ttf",
        "ins-font.woff",
      ];
      const fonts = fontsName.map(
        (fonts: string) => baseUrl + "/pwa/fonts/" + fonts
      );
      result.fonts = fonts;
    }
    return result;
  }
}
