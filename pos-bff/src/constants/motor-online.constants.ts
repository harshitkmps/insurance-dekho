import { MOTOR_ONLINE_STATUS } from "./lmw.constants";

export const VEHICLE_CATEGORY_MAPPING_FOR_QUOTES = {
  "1": "tw/getAsyncQuotes",
  "2": "fw/getAsyncQuotes",
  "4": "cv/getAsyncQuotes",
  "8": "cv/getAsyncQuotes",
  "9": "cv/getAsyncQuotes",
};

export const POLICY_DOC_VIEW_DAYS = 7;

export const ALTERNATE_INSURER_DISABLED_FIELDS = [
  "engineNo",
  "chassisNo",
  "prevInsurer",
  "prevPolicyNo",
  "tpPolicyInsurerId",
  "tpPolicyNo",
];

export const VEHICLE_CATEGORY_MAPPING = {
  1: "tw",
  2: "fw",
  4: "cv",
  8: "cv",
  9: "cv",
};

export const RENEWAL_DISABLED_FIELDS = ["prevInsurer"];

export const INSPECTION_RECOMMENDED_DISABLED_FIELDS = [
  "registrationNo",
  "tpPrevPolicyEndDate",
  "tpPolicyInsurerId",
  "tpPolicyNo",
  "prevPolicyNo",
  "chasisNoNew",
  "chassisNo",
  "engineNo",
  "fullName",
];

export const HIDE_EDIT_DETAILS_BASED_ON_LMW_STATUS = [
  MOTOR_ONLINE_STATUS.STATUS_BOOKED,
  MOTOR_ONLINE_STATUS.STATUS_CANCELED,
  MOTOR_ONLINE_STATUS.STATUS_PAYMENT,
];
