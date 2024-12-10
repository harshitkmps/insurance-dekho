import { HttpException, HttpStatus } from "@nestjs/common";
import { AxiosError } from "axios";
import { get } from "lodash";

export default class ErrorUtils {
  static throwCustomErrors(response: any, errorResponseMap: any) {
    const status = get(response, errorResponseMap?.status) ?? 500;
    const message =
      get(response, errorResponseMap?.message) ?? "Something went wrong";
    const data = get(response, errorResponseMap?.data) ?? {};
    throw new HttpException(message, status, { cause: data });
  }

  static throw(error: AxiosError, config: any = {}): any {
    //if response is not present in error
    if (!error.response) {
      const message = error?.message ?? error;
      throw new HttpException(message, HttpStatus.SERVICE_UNAVAILABLE);
    }

    //if custom mapper is provided then map customer error
    if (config?.errorResponseMap) {
      this.throwCustomErrors(error?.response, config.errorResponseMap);
    }

    //throw default errors
    const errorCode = error?.response?.status ?? 500;
    throw new HttpException(error.response.data, errorCode);
  }
}
