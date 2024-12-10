import { Inject, Service } from "typedi";
import HttpService from "../http-service";
@Service()
export default class CommonApiHelper {
  @Inject()
  private httpService: HttpService;
  public async getData(properties: any, body: any): Promise<any> {
    if (properties.method === "POST") {
      return await this.postData(properties, body);
    }
    if (properties.method === "GET") {
      return await this.fetchData(properties, body);
    }
    if (properties.method === "PUT") {
      return await this.putData(properties, body);
    }
    if (properties.method === "PATCH") {
      return await this.patchData(properties, body);
    }
    throw new Error("Method not implemented.");
  }

  public async fetchData<T>(options: any, params: any): Promise<T> {
    const config = options.config ? options.config : {};
    const endpoint = options.endpoint;
    const data = await this.httpService.get<T>(endpoint, params, config);
    return data;
  }

  public async postData<T>(options: any, body: any) {
    const config = options.config ? options.config : {};
    const endpoint = options.endpoint;
    const data = await this.httpService.post<T>(endpoint, body, config);
    return data;
  }

  public async putData<T>(options: any, body: any) {
    const headers = options.config ? options.config : {};
    const endpoint = options.endpoint;
    const data = await this.httpService.put<T>(endpoint, body, headers);
    return data;
  }

  public async patchData<T>(options: any, body: any) {
    const headers = options.config ? options.config : {};
    const endpoint = options.endpoint;
    const data = await this.httpService.patch<T>(endpoint, body, headers);
    return data;
  }
}
