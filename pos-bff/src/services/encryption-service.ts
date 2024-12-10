import { AxiosResponse } from "axios";
import { EncryptedData } from "../interfaces/encryption/encryption-response.interface";
import CommonApiHelper from "./helpers/common-api-helper";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

@Injectable()
export default class EncryptionService {
  constructor(private apiHelper: CommonApiHelper) {}

  public async encrypt(request: string[]): Promise<EncryptedData[]> {
    if (!request?.length) {
      return [];
    }
    try {
      Logger.debug("encrypting request ", request);
      const headers = {
        Authorization: process.env.ENCRYPTION_SERVICE_AUTHORIZATION,
        "Content-Type": "application/json",
      };
      const options = {
        endpoint: process.env.ENCRYPTION_SERVICE_URL + "/cipher/v3/encrypt",
        method: "POST",
        headers: headers,
      };
      const requestBody = {
        data: request,
      };
      const response: AxiosResponse<EncryptedData[]> =
        await this.apiHelper.postData(options, requestBody);
      return response.data;
    } catch (error) {
      throw new HttpException(
        "Some error occurred while fetching data from encryption service",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  public async decrypt(request: string[]): Promise<any> {
    try {
      Logger.debug("decrypting request ", request);
      const options = {
        endpoint: process.env.ENCRYPTION_SERVICE_URL + "/cipher/v2/decrypt",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.ENCRYPTION_SERVICE_AUTHORIZATION,
        },
      };
      const requestBody = {
        data: request,
      };
      const response = await this.apiHelper.postData(options, requestBody);
      return response;
    } catch (error) {
      Logger.error("Error while decryption of details : ", request);
    }
  }

  public async assignDecryptedValuesToParticularParamOfObjects(
    objects: any[],
    dataToDecrypt: string[],
    param: any
  ) {
    try {
      Logger.debug(
        "In process of assignDecryptedValuesToParticularParamOfObjects"
      );
      const decryptionResponse = await this.decrypt(dataToDecrypt);
      if (!decryptionResponse.data) {
        return objects;
      }
      objects.forEach((object) => {
        object[param] =
          typeof decryptionResponse.data[object[param]]?.decrypted === "string"
            ? decryptionResponse.data[object[param]]?.decrypted
            : null;
      });
    } catch (err) {
      Logger.error("Error in assignDecryptedValuesToParticularParamOfObjects");
    }
  }
}
