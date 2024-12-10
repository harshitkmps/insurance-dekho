import { Service } from "typedi";
import axios from "axios";
import { logger } from "@/utils/logger";
import { HttpException } from "@/exceptions/HttpException";

@Service()
export default class HttpService {
  async get<T>(path: string, parameters: Object, config: Object) {
    try {
      logger.info(
        `requesting resource from service ${path}`,
        parameters,
        config
      );
      const queryString = await this.buildQueryString(parameters);
      let url = "";
      if (queryString) {
        url = path + "?" + queryString;
      } else {
        url = path;
      }
      const response = await axios.get<T>(url, config);
      if (!response || !response.data)
        throw new HttpException(503, "error occured while fetching resource");
      logger.debug("response received ", response.data);
      return response.data;
    } catch (error) {
      if (!error.response) {
        const message = error.message ? error.message : error;
        throw new HttpException(503, message);
      }
      const errorCode = error.response.status ? error.response.status : 500;
      throw new HttpException(errorCode, error.response.data);
    }
  }
  async buildQueryString(parameters: Object) {
    return Object.keys(parameters)
      .map((key) => key + "=" + parameters[key])
      .join("&");
  }

  async post<T>(endpoint: string, body: any, config: any) {
    try {
      logger.info(`requesting resource from service ${endpoint}`, config);
      const response = await axios.post<T>(endpoint, body, config);
      if (!response || !response.data)
        throw new HttpException(503, "error occured while fetching resource");
      return response.data;
    } catch (error) {
      if (!error.response) {
        const message = error.message ? error.message : error;
        throw new HttpException(503, message);
      }
      const errorCode = error.response.status ? error.response.status : 500;
      throw new HttpException(errorCode, error.response.data);
    }
  }
  async put<T>(endpoint: string, body: any, headers: any) {
    try {
      logger.info(
        `requesting resource from service ${endpoint}`,
        body,
        headers
      );
      const response = await axios.put<T>(endpoint, body, headers);
      if (!response || !response.data)
        throw new HttpException(409, "error occured while fetching resource");
      return response.data;
    } catch (error) {
      if (!error.response) {
        const message = error.message ? error.message : error;
        throw new HttpException(503, message);
      }
      const errorCode = error.response.status ? error.response.status : 500;
      throw new HttpException(errorCode, error.response.data);
    }
  }

  async patch<T>(endpoint: string, body: any, headers: any) {
    try {
      logger.info(
        `requesting resource from service ${endpoint}`,
        body,
        headers
      );
      const response = await axios.patch<T>(endpoint, body, headers);
      if (!response || !response.data)
        throw new HttpException(409, "error occured while fetching resource");
      return response.data;
    } catch (error) {
      if (!error.response) {
        const message = error.message ? error.message : error;
        throw new HttpException(503, message);
      }
      const errorCode = error.response.status ? error.response.status : 500;
      throw new HttpException(errorCode, error.response.data);
    }
  }
}
