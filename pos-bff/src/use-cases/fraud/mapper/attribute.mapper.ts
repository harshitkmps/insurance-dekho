import { AttributeDto } from "../dtos/attributes-request";

export default class AttributeMapper {
  static builder(requestObject: any) {
    const attribute: AttributeDto = {
      key: requestObject.key ?? "",
      value: requestObject.value ?? "",
      isEncrypted: requestObject.isEncrypted ?? false,
    };
    return attribute;
  }
}
