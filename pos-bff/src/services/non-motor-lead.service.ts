import CommonApiHelper from "./helpers/common-api-helper";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { LMWConstants } from "../constants/lmw.constants";

@Injectable()
export default class NonMotorLeadService {
  constructor(private apiHelper: CommonApiHelper) {}

  public async addNonMotorLead(data: any): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_LMW_ENDPOINT + `/api/life/v1/lead`,
      };
      const response = await this.apiHelper.postData(options, data);
      return response;
    } catch (error) {
      throw new HttpException(
        error,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async saveSelectedQuote(data: any): Promise<any> {
    try {
      const endpointMap: { [key: string]: string } = {
        nonMotor: `${process.env.API_QMW_ENDPOINT}/non-motor/push-selected-quotes`,
        life: `${process.env.API_LMW_ENDPOINT}/api/life/v1/quotes/pushSelected?`,
      };
      const productType = LMWConstants.NON_MOTOR_PRODUCT_TYPES.includes(
        data?.productType
      )
        ? "nonMotor"
        : "life";
      const options = { endpoint: endpointMap[productType] };
      const response = await this.apiHelper.postData(options, data);
      return response;
    } catch (error) {
      throw new HttpException(error?.status || 500, error);
    }
  }
  public async saveProposalDetails(data: any): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_LMW_ENDPOINT + `/api/life/v1/proposal`,
      };
      const response = await this.apiHelper.postData(options, data);
      return response;
    } catch (error) {
      throw new HttpException(error?.status || 500, error);
    }
  }
  public async submitProposalDetails(data: any): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_LMW_ENDPOINT + `/api/life/v1/proposal/submit`,
      };
      const response = await this.apiHelper.postData(options, data);
      return response;
    } catch (error) {
      throw new HttpException(error?.status || 500, error);
    }
  }
}
