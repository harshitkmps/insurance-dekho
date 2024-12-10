import moment from "moment";
import { Service } from "typedi";

@Service()
export class FilesComparatorDecorator {
  public formatITMSDateTimeToDate(date: string) {
    return date ? moment(date).format("YYYY-MM-DD") : "";
  }

  public removeDecimals(value: string): string {
    return isNaN(value as any) ? value : parseInt(value).toString();
  }
}
