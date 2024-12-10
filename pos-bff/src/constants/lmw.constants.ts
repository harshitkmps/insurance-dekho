export const LMWConstants = {
  NON_MOTOR_PRODUCT_TYPES: [
    "travel",
    "fire",
    "specificMarine",
    "workmenCompensation",
    "hospicash",
    "wellness",
    "professionalIndemnity",
    "home",
    "groupHealth",
    "home",
  ],
  SME_PRODUCT_TYPES: [
    "fire",
    "specificMarine",
    "workmenCompensation",
    "professionalIndemnity",
    "home",
    "sme",
    "home",
  ],
  OTP_NON_MOTOR_PRODUCT_TYPES: [
    "travel",
    "fire",
    "specificMarine",
    "workmenCompensation",
    "professionalIndemnity",
    "home",
    "hospicash",
  ],
  PAYMENT_LINK_FROM_UPDATE_LEAD_PRODUCTS: ["wellness", "groupHealth"],
};

export const NON_MOTOR_POLICY_ACCESS_LOBS = ["travel"];

export const MOTOR_ONLINE_STATUS = {
  STATUS_LEAD_GENERATED: 1,
  STATUS_QUOTE_SELECTED: 2,
  STATUS_PROPOSAL: 3,
  STATUS_INSPECTION: 8,
  STATUS_PAYMENT: 18,
  STATUS_BOOKED: 23,
  STATUS_CANCELED: 24,
};

export const MOTOR_ONLINE_SUB_STATUS = {
  STATUS_PROPOSAL_PENDING: 7,
  STATUS_INSPECTION_PENDING: 9,
  STATUS_INSPECTION_COMPLETE: 10,
  STATUS_INSPECTION_RECOMMENDED: 11,
  STATUS_INSPECTION_INVALID: 12,
  STATUS_PAYMENT_DONE_PROPOSAL_FAILED: 19,
  STATUS_PAYMENT_DONE_POLICY_UNAVAILABLE: 20,
  STATUS_PAYMENT_PENDING_FROM_INSURER: 21,
  STATUS_PAYMENT_FAILED: 22,
  STATUS_PAYMENT_DONE: 25,
};

export const BANK_ENCRYPTION_FIELDS = ["accountNumber"];
