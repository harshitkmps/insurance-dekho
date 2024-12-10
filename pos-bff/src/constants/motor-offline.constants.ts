import { MOTOR_OFFLINE_STATUS } from "./itms.constants";

export const MOTOR_OFFLINE_NAVBAR = {
  heading: "Motor Insurance",
  steps: [
    {
      step: "basicDetails",
      displayName: "Vehicle Details",
      link: "",
      isCompleted: false,
      isClickable: false,
    },
    {
      step: "quotes",
      displayName: "Quotes",
      link: "",
      isCompleted: false,
      isClickable: false,
    },
    {
      displayName: "Owner Details",
      link: "",
      isCompleted: false,
      isClickable: false,
    },
    {
      displayName: "Nominee Details",
      link: "",
      isCompleted: false,
      isClickable: false,
    },
    {
      displayName: "Vehicle Details",
      link: "",
      isCompleted: false,
      isClickable: false,
    },
    {
      displayName: "Other Details",
      link: "",
      isCompleted: false,
      isClickable: false,
    },
    {
      displayName: "Documents",
      link: "",
      isCompleted: false,
      isClickable: false,
    },
    {
      displayName: "Inspection",
      link: "",
      isCompleted: false,
      isClickable: false,
    },
    {
      displayName: "Summary",
      link: "",
      isCompleted: false,
      isClickable: false,
    },
    {
      displayName: "Payment",
      link: "",
      isCompleted: false,
      isClickable: false,
    },
  ],
};

export const OFFLINE_STEPS = {
  basicDetails: {
    path: "core/offline/basic-details",
  },
};

export const OFFLINE_INSPECTION_STATUS = [
  MOTOR_OFFLINE_STATUS.INSPECTION_REQUESTED,
  MOTOR_OFFLINE_STATUS.INSPECTION_SCHEDULE,
  MOTOR_OFFLINE_STATUS.INSPECTION_RECOMMENDED,
  MOTOR_OFFLINE_STATUS.INSPECTION_COMPLETED,
  MOTOR_OFFLINE_STATUS.INSPECTION_NOT_RECOMMENDED,
  MOTOR_OFFLINE_STATUS.INSPECTION_EXPIRED,
];

export const OFFLINE_INSPECTION_EXTENDED_TIMELINE = {
  [MOTOR_OFFLINE_STATUS.INSPECTION_REQUESTED]: [
    {
      displayName: "Inspection Schedule",
    },
    {
      displayName: "Inspection Completed",
    },
    {
      displayName: "Inspection Recommended",
    },
  ],
  [MOTOR_OFFLINE_STATUS.INSPECTION_SCHEDULE]: [
    {
      displayName: "Inspection Completed",
    },
    {
      displayName: "Inspection Recommended",
    },
  ],
  [MOTOR_OFFLINE_STATUS.INSPECTION_COMPLETED]: [
    {
      displayName: "Inspection Recommended",
    },
  ],
};

export const OFFLINE_REQUEST = {
  QUOTE_REQUEST: "QUOTEREQUEST",
  DIRECT_ISSUANCE: "DIRECTISSUANCE",
  POLICY_BOOKING: "POLICYBOOKING",
};
