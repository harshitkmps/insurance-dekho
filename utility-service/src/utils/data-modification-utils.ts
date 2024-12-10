import moment from "moment";

export default class DataModificationUtils {
  static dateToHyphenSeparatedDescDateString(value: string) {
    try {
      const modifiedValue = moment(value).format("YYYY-MM-DD");
      return modifiedValue;
    } catch (error) {
      return value;
    }
  }

  static jsonToString(value: string | any) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return value;
    }
  }

  static trimString(value: any) {
    try {
      if (typeof value === "string") {
        return value?.trim();
      }
      return value;
    } catch (error) {
      return value;
    }
  }

  static splitDatesOnCount(
    parentStartDate: moment.Moment,
    parentEndDate: moment.Moment,
    parallelCount: number
  ) {
    const dateRanges = [];
    const daysCount = parentEndDate.diff(parentStartDate, "days") + 1;

    const duration = Math.floor(daysCount / parallelCount);

    let updatedStartDate = moment(parentStartDate);
    let updatedEndDate = moment(parentStartDate);

    if (daysCount <= parallelCount) {
      parallelCount = 1;
    }

    for (let batch = 0; batch < parallelCount; batch++) {
      if (parallelCount === 1) {
        updatedStartDate = parentStartDate.clone();
        updatedEndDate = parentEndDate.clone();
      } else if (batch === 0) {
        updatedEndDate = updatedEndDate.clone().add(duration, "days");
      } else if (batch === parallelCount - 1) {
        updatedStartDate = updatedEndDate.clone().add(1, "millisecond");
        updatedEndDate = parentEndDate.clone();
      } else {
        updatedStartDate = updatedEndDate.clone().add(1, "millisecond");
        updatedEndDate = updatedStartDate.clone().add(duration, "days");
      }

      updatedEndDate.subtract(1, "millisecond");

      dateRanges.push({
        startDate: new Date(updatedStartDate.toString()).toISOString(),
        endDate: new Date(updatedEndDate.toString()).toISOString(),
      });
    }
    return { dateRanges };
  }

  static splitDatesDayWise(
    parentStartDate: moment.Moment,
    parentEndDate: moment.Moment
  ) {
    const dateRanges = [];
    const daysCount = parentEndDate.diff(parentStartDate, "days") + 1;
    const updatedStartDate = moment(parentStartDate);
    const updatedEndDate = moment(parentStartDate);
    updatedEndDate.subtract(1, "milliseconds");

    for (let batch = 0; batch < daysCount; batch++) {
      if (batch === 0) {
        updatedEndDate.add(1, "days");
      } else {
        updatedStartDate.add(1, "days");
        updatedEndDate.add(1, "days");
      }

      dateRanges.push({
        startDate: new Date(updatedStartDate.toString()).toISOString(),
        endDate: new Date(updatedEndDate.toString()).toISOString(),
      });
    }
    return { dateRanges };
  }
}
