import { vehicleTypeMapping } from "../constants/quotes.constants";
import { Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { ConfigService } from "@nestjs/config";
import { AxiosResponse } from "axios";

@Injectable()
export default class QuotesService {
  constructor(
    private apiHelper: CommonApiHelper,
    private readonly configService: ConfigService
  ) {}

  public async getMotorQuotes(
    reqBody: any,
    showScoreCard: boolean,
    channelType: number,
    channelSubType: number,
    masterGCDCode: string,
    gcdCode: string
  ): Promise<any> {
    try {
      const body = {
        ...reqBody,
        showCommissionScoreCard: showScoreCard,
        channelType,
        channelSubType,
        gcdCode,
        masterGCDCode,
      };
      const options = {
        endpoint: `${process.env.API_QMW_ENDPOINT}/motor/${
          vehicleTypeMapping[body.vehicleCategory]
        }`,
      };
      Logger.debug(`Motor Quotes body request ${gcdCode}`, { body });
      const quotesWithScores: any = await this.apiHelper.postData(
        options,
        body
      );
      Logger.debug(`Motor Quotes API Response ${gcdCode}`, {
        options,
        quotesWithScores,
      });
      return quotesWithScores.data;
    } catch (err) {
      Logger.error("error in motor quotes API", { err });
      const quotesWithScores = {};
      return quotesWithScores;
    }
  }

  public async getHealthQuotesScoreCard(
    reqBody: any,
    gcdCode: string,
    showScoreCard: boolean,
    channelType: number,
    channelSubType: number,
    masterGCDCode: string,
    channelCity: number
  ): Promise<any> {
    try {
      const body = {
        ...reqBody,
        showCommissionScoreCard: showScoreCard,
        channelPartnerType: channelType,
        channelPartnerSubType: channelSubType,
        gcdCode,
        masterGCDCode,
        channelCity: channelCity,
      };
      const options = {
        endpoint: `${process.env.API_QMW_HEALTH_URL}/health/quotes/get-quotes`,
      };
      Logger.debug(`Health Quotes body request ${gcdCode}`, {
        body,
      });
      const quotesWithScores: any = await this.apiHelper.postData(
        options,
        body
      );
      Logger.debug(`Health Quotes API Response  ${gcdCode}`, {
        options,
        quotesWithScores,
      });
      return quotesWithScores.result;
    } catch (err) {
      Logger.error("error in health quotes API", { err });
      const quotesWithScores = {};
      return quotesWithScores;
    }
  }

  public async getHospicashQuotes(
    reqBody: any,
    gcdCode: string,
    showScoreCard: boolean,
    channelType: number,
    channelSubType: number,
    masterGCDCode: string,
    channelCity: number
  ): Promise<any> {
    try {
      const body = {
        ...reqBody,
        showCommissionScoreCard: showScoreCard,
        channelPartnerType: channelType,
        channelPartnerSubType: channelSubType,
        gcdCode,
        masterGCDCode,
        channelCity: channelCity,
      };
      const options = {
        endpoint: `${process.env.API_QMW_ENDPOINT}/health/quotes`,
      };
      Logger.debug(`Hospicash Quotes body request ${gcdCode}`, {
        body,
      });
      const quotesWithScores: any = await this.apiHelper.postData(
        options,
        body
      );
      return quotesWithScores.result;
    } catch (err) {
      Logger.error("error in health quotes API", { err });
      const quotesWithScores = {};
      return quotesWithScores;
    }
  }

  public async getTravelQuotes(
    reqBody: any,
    gcdCode: string,
    showScoreCard: boolean,
    channelType: number,
    channelSubType: number,
    masterGCDCode: string,
    channelCity: number
  ): Promise<any> {
    try {
      const body = {
        ...reqBody,
        showCommissionScoreCard: showScoreCard,
        channelType: channelType,
        channelSubType: channelSubType,
        gcdCode,
        masterGCDCode,
        channelCity: channelCity,
      };
      const options = {
        endpoint: `${process.env.API_QMW_ENDPOINT}/non-motor/quotes`,
      };
      Logger.debug("Travel Quotes body request", { body });
      const quotesWithScores: any = await this.apiHelper.postData(
        options,
        body
      );
      Logger.debug("Travel Quotes API Response", {
        options,
        quotesWithScores,
      });
      return quotesWithScores || quotesWithScores.errors;
    } catch (err) {
      Logger.error("error in travel quotes API", { err });
      const quotesWithScores = {};
      return quotesWithScores;
    }
  }

  public async getLifeQuotes(
    reqBody: any,
    gcdCode: string,
    showScoreCard: boolean,
    channelType: number,
    channelSubType: number,
    masterGCDCode: string,
    channelCity: number
  ): Promise<any> {
    try {
      const body = {
        ...reqBody,
        showCommissionScoreCard: showScoreCard,
        channelType: channelType,
        channelSubType: channelSubType,
        gcdCode,
        masterGCDCode,
        channelCity: channelCity,
      };
      const options = {
        endpoint: `${process.env.API_QMW_ENDPOINT}/life/quotes`,
      };
      Logger.debug("Life Quotes body request", { body });
      const quotesWithScores: any = await this.apiHelper.postData(
        options,
        body
      );
      Logger.debug("Life Quotes API Response", {
        options,
        quotesWithScores,
      });
      return quotesWithScores?.data || quotesWithScores.errors;
    } catch (err) {
      Logger.error("error in life quotes API", { err });
      const quotesWithScores = {};
      return quotesWithScores;
    }
  }

  public async getPetQuotes(
    reqBody: any,
    gcdCode: string,
    showScoreCard: boolean,
    channelType: number,
    channelSubType: number,
    masterGCDCode: string,
    channelCity: number
  ): Promise<any> {
    try {
      const body = {
        ...reqBody,
        showCommissionScoreCard: showScoreCard,
        channelType: channelType,
        channelSubType: channelSubType,
        gcdCode,
        masterGCDCode,
        channelCity: channelCity,
      };
      const options = {
        endpoint: `${process.env.API_QMW_ENDPOINT}/non-motor/quotes`,
      };
      Logger.debug("Pet Quotes body request", { body });
      const quotesWithScores: any = await this.apiHelper.postData(
        options,
        body
      );
      Logger.debug("Pet Quotes API Response", {
        options,
        quotesWithScores,
      });
      return quotesWithScores || quotesWithScores.errors;
    } catch (err) {
      Logger.error("error in pet quotes API", { err });
      const quotesWithScores = {};
      return quotesWithScores;
    }
  }

  public async getHealthQuotes(body: any): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.API_QMW_HEALTH_URL}/health/quotes/get-quotes`,
      };
      Logger.debug("Health/PA Quotes body request", { body });
      const quotes: any = await this.apiHelper.postData(options, body);
      Logger.debug("Health/PA API Response", {
        options,
        quotes,
      });
      return quotes.result || quotes.errors;
    } catch (err) {
      Logger.error("error in health/PA quotes API", { err });
      const quotes = {};
      return quotes;
    }
  }

  public async fetchSelectedQuote(body: any): Promise<any> {
    try {
      const result: any = {
        success: false,
      };
      const options = {
        endpoint: `${process.env.API_QMW_HEALTH_URL}/health/quotes/selected-quote`,
      };
      Logger.debug("Personal Accident Quotes body request", { body });
      const quoteSelected: any = await this.apiHelper.postData(options, body);
      Logger.debug("Personal Accident API Response", {
        options,
        quoteSelected,
      });
      if (quoteSelected?.errors?.length) {
        result.errors = quoteSelected.errors;
        return result;
      }
      result.success = true;
      result.data = quoteSelected.result;
      return result;
    } catch (err) {
      Logger.error("error in health quotes API", { err: err?.response ?? err });
      const quoteSelected = {};
      return quoteSelected;
    }
  }

  public async selectAddons(body: any): Promise<any> {
    try {
      const result: any = {
        success: false,
      };
      const options = {
        endpoint: `${process.env.API_QMW_HEALTH_URL}/health/quotes/selected-addons`,
      };
      Logger.debug("Personal Accident Quotes body request", { body });
      const addonsSelected: any = await this.apiHelper.postData(options, body);
      Logger.debug("Personal Accident API Response", {
        options,
        addonsSelected,
      });
      if (addonsSelected?.errors?.length) {
        result.errors = addonsSelected.errors;
        return result;
      }
      result.success = true;
      result.data = addonsSelected.result;
      return result;
    } catch (err) {
      Logger.error("error in health quotes API", { err });
      const addonsSelected = {};
      return addonsSelected;
    }
  }

  public async getSMEQuotes(
    reqBody: any,
    gcdCode: string,
    showScoreCard: boolean,
    channelType: number,
    channelSubType: number,
    masterGCDCode: string,
    channelCity: number
  ): Promise<any> {
    try {
      const body = {
        ...reqBody,
        showCommissionScoreCard: showScoreCard,
        channelType,
        channelSubType: channelSubType,
        gcdCode,
        masterGCDCode,
        channelCity: channelCity,
      };
      const options = {
        endpoint: `${process.env.API_QMW_ENDPOINT}/non-motor/quotes`,
      };
      Logger.debug("SME Quotes body request", { body });
      const quotesWithScores: any = await this.apiHelper.postData(
        options,
        body
      );
      Logger.debug("SME Quotes API Response", {
        options,
        quotesWithScores,
      });
      return quotesWithScores || quotesWithScores.errors;
    } catch (err) {
      Logger.error("error in sme quotes API", { err });
      return {};
    }
  }

  public async pushMotorSelectedQuote(
    vehicleCategory: string,
    body: any
  ): Promise<any> {
    const baseUrl = await this.configService.get("API_QMW_ENDPOINT");
    const options = {
      endpoint: `${baseUrl}/motor/${vehicleCategory}/pushSelectedQuotes`,
    };
    Logger.debug(`Motor QMW push share Quote`, { options });

    const response: AxiosResponse<any> = await this.apiHelper.postData(
      options,
      body
    );
    return response?.data;
  }
}
