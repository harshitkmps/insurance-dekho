import moment from "moment";
import {
  ACHIEVED_TARGET_MAP,
  SALES_PERFORMANCE_KEYS,
  WTD_CONFIG,
} from "../constants/dashboard.constants";

export default class DashboardUtils {
  static getTitleFor(key: string) {
    const titleMap = {
      policies: "Total policies",
      premium: "Total Premium",
      renewals: "Renewals",
      agentActivation: "Agent activations",
    };
    return titleMap[key] || key;
  }
  static parseValue(key: string, value: { toString: () => any }) {
    if (key === "premium") {
      return value ? `₹${value}` : "";
    }
    return value ? value.toString() : "";
  }

  static parsePercent(key: string, percent: { toString: () => any }) {
    return percent ? `${percent} %` : "";
  }

  static isPercentagePositive(percent: string | string[]): boolean {
    return percent && !percent.includes("-") ? true : false;
  }

  static getDateRangeForTimeDuration(timeDuration: string): any {
    const TimeDurationMap = {
      mtd: () => ({
        startDate: moment().startOf("month").format("YYYY-MM-DD"),
        endDate: moment().format("YYYY-MM-DD"),
        comparisonStartDate: moment()
          .subtract(1, "month")
          .startOf("month")
          .format("YYYY-MM-DD"),
        comparisonEndDate: moment()
          .subtract(1, "month")
          .endOf("month")
          .format("YYYY-MM-DD"),
      }),
      ftd: () => ({
        startDate: moment().startOf("day").format("YYYY-MM-DD"),
        endDate: moment().format("YYYY-MM-DD"),
        comparisonStartDate: moment()
          .subtract(1, "day")
          .startOf("day")
          .format("YYYY-MM-DD"),
        comparisonEndDate: moment()
          .subtract(1, "day")
          .endOf("day")
          .format("YYYY-MM-DD"),
      }),
      wtd: () => {
        const lastWeekOfMonth = WTD_CONFIG[WTD_CONFIG.length - 1];
        const currDate = moment().date();
        const currWeekIndex = WTD_CONFIG.findIndex(
          (week) => currDate >= week.startDay && currDate <= week.endDay
        );
        const startDate = moment().date(WTD_CONFIG[currWeekIndex].startDay);
        const endDate = WTD_CONFIG[currWeekIndex].endDay
          ? moment().date(WTD_CONFIG[currWeekIndex].endDay)
          : moment().endOf("month");
        const comparisonStartDate =
          currWeekIndex === 0
            ? moment().subtract(1, "month").date(lastWeekOfMonth.startDay)
            : moment().date(WTD_CONFIG[currWeekIndex - 1].startDay);
        const comparisonEndDate =
          currWeekIndex === 0
            ? moment().subtract(1, "month").endOf("month")
            : moment().date(WTD_CONFIG[currWeekIndex - 1].endDay);

        return {
          startDate,
          endDate,
          comparisonStartDate,
          comparisonEndDate,
        };
      },
    };
    return TimeDurationMap[timeDuration]?.();
  }

  static prepareTrendGraphView(data: any[]): any {
    const labels = moment.months().slice(0, moment().month() + 1);
    const nops = new Array(labels.length).fill(0);
    const premiums = new Array(labels.length).fill(0);
    for (const entry of data) {
      const arrayIndex = entry.month - 1; // month starts with 1
      nops[arrayIndex] = entry.nop;
      premiums[arrayIndex] = entry.net_premium;
    }
    return {
      labels,
      datasets: [
        {
          label: "NOP",
          data: nops,
          yAxisID: "nop",
          backgroundColor: "#FF9364",
          borderWidth: 3,
          borderColor: "#FF9364",
          datalabels: {
            display: false,
          },
        },
        {
          type: "bar",
          label: "Premium",
          data: premiums,
          yAxisID: "premium",
          backgroundColor: "#D8CFFF",
          datalabels: {
            display: true,
          },
        },
      ],
    };
  }

  static getSalesViewCohorts(achieved: object, target: object) {
    const result = [];
    for (const cohort of SALES_PERFORMANCE_KEYS) {
      if (achieved.hasOwnProperty(cohort.key)) {
        const targetData = target[ACHIEVED_TARGET_MAP[cohort.key]] ?? 0;
        let achievPercent = "-";
        if (targetData > 0) {
          achievPercent = `${Math.round(
            (achieved[cohort.key] / targetData) * 100
          )}%`;
        }
        const cohortObj = {
          key: cohort.key,
          label: cohort.name,
          achieved: achieved[cohort.key],
          target: targetData,
          achievPercent,
          isBreakup: false,
        };
        result.push(cohortObj);
      }
    }
    return result;
  }
}
