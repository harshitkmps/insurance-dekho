import { Roles } from "../constants/roles.constants";

export default class ViewUtils {
  static showDropDown(roleId: any) {
    const isSalesUser = Roles.POS_SALES_ALL.includes(parseInt(roleId));
    const isInternalUser = process.env.POS_INTERNAL_USER_ROLE_LIST.split(
      ","
    ).find((x) => x == roleId);
    return isSalesUser || isInternalUser;
  }

  static maskData(data: string): string {
    if (!data) {
      return "";
    }
    const first2Char = data.slice(0, 2).trim();
    const last2Char = data.slice(-2).trim();
    return `${first2Char}####${last2Char}`;
  }

  static maskFields(data: any, fields: string[]): any {
    const updatedData = { ...data };
    for (const field of fields) {
      if (updatedData[field]) {
        updatedData[field] = ViewUtils.maskData(updatedData[field].toString());
      }
    }
    return updatedData;
  }
}
