// import ErrorUtils from "@/src/utils/error-utils";
import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { AxiosError, AxiosResponse } from "axios";
import { get } from "lodash";
import { catchError, lastValueFrom, map } from "rxjs";

@Injectable()
export default class CommonApiHelper {
  constructor(private httpService: HttpService) {}

  public async getData<T>(properties: any, body: any): Promise<T> {
    if (properties.method === "POST") {
      return this.postData(properties, body);
    }
    if (properties.method === "GET") {
      return this.fetchData(properties, body);
    }
    if (properties.method === "PUT") {
      return this.putData(properties, body);
    }
    if (properties.method === "PATCH") {
      return this.patchData(properties, body);
    }
    throw new Error("Method not implemented.");
  }

  public async fetchData<T>(options: any, params: any): Promise<T> {
    const config = options.config ? options.config : {};
    const endpoint = options.endpoint;
    const queryString = new URLSearchParams(params).toString();
    let url = endpoint;
    if (queryString) {
      url += "?" + queryString;
    }
    Logger.log(`requesting resource from GET url : ${url}`);
    const { data } = await lastValueFrom(
      this.httpService.get<T>(url, config).pipe(
        map((res: AxiosResponse) => res),
        catchError((err: AxiosError) => {
          Logger.error(`error in GET url: ${endpoint} ${err}`);
          if (!err.response) {
            const message = err?.message ?? err;
            throw new HttpException(message, HttpStatus.SERVICE_UNAVAILABLE);
          }

          //if custom mapper is provided then map customer error
          if (config?.errorResponseMap) {
            const status =
              get(err?.response, config.errorResponseMap?.status) ?? 500;
            const message =
              get(err?.response, config.errorResponseMap?.message) ??
              "Something went wrong";
            const data =
              get(err?.response, config.errorResponseMap?.data) ?? {};
            throw new HttpException(message, status, { cause: data });
          }

          //throw default errors
          const errorCode = err?.response?.status ?? 500;
          throw new HttpException(err.response.data, errorCode);
        })
      )
    );
    return data;
  }

  public async postData<T>(options: any, body: any) {
    const config = options.config ? options.config : {};
    const endpoint = options.endpoint;
    Logger.log(`requesting resource from POST url : ${endpoint}`);
    const { data, headers } = await lastValueFrom(
      this.httpService.post<T>(endpoint, body, config).pipe(
        map((res: AxiosResponse) => res),
        catchError((err: AxiosError) => {
          Logger.error(`error in POST url: ${endpoint}`, {
            data: err?.response?.data,
          });
          if (!err.response) {
            const message = err?.message ?? err;
            throw new HttpException(message, HttpStatus.SERVICE_UNAVAILABLE);
          }

          //if custom mapper is provided then map customer error
          if (config?.errorResponseMap) {
            const status =
              get(err?.response, config.errorResponseMap?.status) ?? 500;
            const message =
              get(err?.response, config.errorResponseMap?.message) ??
              "Something went wrong";
            const data =
              get(err?.response, config.errorResponseMap?.data) ?? {};
            throw new HttpException(message, status, { cause: data });
          }

          //throw default errors
          const errorCode = err?.response?.status ?? 500;
          throw new HttpException(err.response.data, errorCode);
        })
      )
    );
    if (options?.config?.isResHeadersRequired) {
      return { headers, data };
    }
    return data;
  }

  public async putData<T>(options: any, body: any): Promise<T> {
    const config = options.config ? options.config : {};
    const endpoint = options.endpoint;
    Logger.log(`requesting resource from PUT url : ${endpoint}`, {
      options,
      body,
    });
    const { data } = await lastValueFrom(
      this.httpService.put<T>(endpoint, body, config).pipe(
        map((res: AxiosResponse) => {
          Logger.debug("received response", res.data);
          return res;
        }),
        catchError((err: AxiosError) => {
          Logger.error(`error in PUT url: ${endpoint} ${err}`);
          if (!err.response) {
            const message = err?.message ?? err;
            throw new HttpException(message, HttpStatus.SERVICE_UNAVAILABLE);
          }

          //if custom mapper is provided then map customer error
          if (config?.errorResponseMap) {
            const status =
              get(err?.response, config.errorResponseMap?.status) ?? 500;
            const message =
              get(err?.response, config.errorResponseMap?.message) ??
              "Something went wrong";
            const data =
              get(err?.response, config.errorResponseMap?.data) ?? {};
            throw new HttpException(message, status, { cause: data });
          }

          //throw default errors
          const errorCode = err?.response?.status ?? 500;
          throw new HttpException(err.response.data, errorCode);
        })
      )
    );
    return data;
  }

  public async deleteData<T>(options: any, body: any): Promise<T> {
    const config = options.config ?? {};
    const endpoint = options.endpoint;
    Logger.log(`requesting resource from DELETE url : ${endpoint}`);
    const { data } = await lastValueFrom(
      this.httpService.delete<T>(endpoint, { ...config, data: body }).pipe(
        map((res: AxiosResponse) => res),
        catchError((err: AxiosError) => {
          Logger.error(`error in DELETE url: ${endpoint} ${err}`);
          if (!err.response) {
            const message = err?.message ?? err;
            throw new HttpException(message, HttpStatus.SERVICE_UNAVAILABLE);
          }

          //if custom mapper is provided then map customer error
          if (config?.errorResponseMap) {
            const status =
              get(err?.response, config.errorResponseMap?.status) ?? 500;
            const message =
              get(err?.response, config.errorResponseMap?.message) ??
              "Something went wrong";
            const data =
              get(err?.response, config.errorResponseMap?.data) ?? {};
            throw new HttpException(message, status, { cause: data });
          }

          //throw default errors
          const errorCode = err?.response?.status ?? 500;
          throw new HttpException(err.response.data, errorCode);
        })
      )
    );
    return data;
  }

  public async patchData<T>(options: any, body: any) {
    const config = options.config ? options.config : {};
    const endpoint = options.endpoint;
    Logger.log(`requesting resource from POST url : ${endpoint}`);
    const { data, headers } = await lastValueFrom(
      this.httpService.patch<T>(endpoint, body, config).pipe(
        map((res: AxiosResponse) => res),
        catchError((err: AxiosError) => {
          Logger.error(`error in POST url: ${endpoint}`, {
            data: err?.response?.data,
          });
          if (!err.response) {
            const message = err?.message ?? err;
            throw new HttpException(message, HttpStatus.SERVICE_UNAVAILABLE);
          }

          //if custom mapper is provided then map customer error
          if (config?.errorResponseMap) {
            const status =
              get(err?.response, config.errorResponseMap?.status) ?? 500;
            const message =
              get(err?.response, config.errorResponseMap?.message) ??
              "Something went wrong";
            const data =
              get(err?.response, config.errorResponseMap?.data) ?? {};
            throw new HttpException(message, status, { cause: data });
          }

          //throw default errors
          const errorCode = err?.response?.status ?? 500;
          throw new HttpException(err.response.data, errorCode);
        })
      )
    );
    if (options?.config?.isResHeadersRequired) {
      return { headers, data };
    }
    return data;
  }
}
