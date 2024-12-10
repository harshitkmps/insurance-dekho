import moment, { unitOfTime } from "moment";
export default class DateTimeUtils {
  static getDateTimeBeforeDays(days: number, date: any): Date;

  static getDateTimeBeforeDays(days: number, date?: Date): Date {
    const now = new Date(date) ?? new Date();
    const newDateTimestamp = now.setDate(now.getDate() + days);
    const newDate = new Date(newDateTimestamp);
    return newDate;
  }

  static getDateTimeAfterDays(days: number, date: any): Date;

  static getDateTimeAfterDays(days: number, date?: Date): Date {
    const now = new Date(date) ?? new Date();
    return this.getDateTimeBeforeDays(days, now);
  }

  static getDate(days: number, date?: Date): string {
    const now = date ?? new Date();
    const newDate = this.getDateTimeBeforeDays(days, now);
    return newDate.toISOString().split("T")[0];
  }

  static getDaysDifference(
    oldDate?: Date,
    newDate?: Date,
    unit: unitOfTime.Diff = "days"
  ) {
    const newDateTime = moment(newDate);
    const oldDateTime = moment(oldDate);
    const difference = newDateTime.diff(oldDateTime, unit);
    return difference;
  }
  static addIST(timestamp) {
    return moment(timestamp).add(5, "hours").add(30, "minutes").format();
  }
  public static getFinancialStartYearFromCurrentDate(): string {
    const today = new Date();
    today.setFullYear(2021);
    let currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    if (currentMonth < 3) {
      currentYear = currentYear - 1;
    }
    const startDateOfFinancialYear = new Date(currentYear, 3, 1);
    return startDateOfFinancialYear.toISOString();
  }

  public static getFinancialEndYearFromCurrentDate(): string {
    const today = new Date();
    let currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    if (currentMonth > 3) {
      currentYear = currentYear + 1;
    }
    const endDateOfNextFinancialYear = new Date(currentYear, 2, 31);
    const options = { timeZone: "Asia/Kolkata" };
    return endDateOfNextFinancialYear.toLocaleString("en-IN", options);
  }
  public static calculateTimeDifferenceInMinutesFromNow = (time: any) => {
    const date = moment(time);
    const nowTime = moment();
    const diffMinutes = date.diff(nowTime, "minutes");
    return diffMinutes;
  };
  public static formatDateToDDMMMYYYY(dateString: string): string {
    return moment(dateString).format("D MMM YYYY");
  }
  public static formatDateToUTC(
    dateString: string,
    isEndOfDay: boolean = false
  ): string {
    const date = moment(dateString);

    if (isEndOfDay) {
      return date.endOf("day").utc(true).toISOString();
    } else {
      return date.startOf("day").utc(true).toISOString();
    }
  }

  public static formatDate(date: string, format: string): string {
    return moment(date).format(format);
  }

  public static getStartAndEndDateFromToday(range = 7) {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();

    startDate.setDate(startDate.getDate() - range);
    return { startDate: startDate.toISOString().split("T")[0], endDate };
  }
}
