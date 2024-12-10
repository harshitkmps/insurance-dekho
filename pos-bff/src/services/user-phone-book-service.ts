import { Injectable } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import ContextHelper from "./helpers/context-helper";
@Injectable()
export default class UserPhoneBookService {
  constructor(private apiHelper: CommonApiHelper) {}
  private getHeaders(): any {
    if (ContextHelper?.getStore()?.get("authorization")) {
      return {
        authorization: ContextHelper.getStore().get("authorization"),
      };
    }
    return {};
  }
  public async updateUserPhoneBook(request): Promise<any> {
    const options = {
      endpoint: `${process.env.FRAUD_SERVICE_ENDPOINT}/api/v1/user/phone-book`,
      config: {
        headers: this.getHeaders(),
      },
    };
    const response = await this.apiHelper.postData(options, request);
    return response.data;
  }
}
