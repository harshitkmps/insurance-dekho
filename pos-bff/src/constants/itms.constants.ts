export const MOTOR_OFFLINE_STATUS = {
  QUOTE_REQUESTED: 201,
  QUOTE_SHARED: 202,
  INSPECTION_REQUESTED: 203,
  INSPECTION_SCHEDULE: 204,
  INSPECTION_RECOMMENDED: 205,
  PROPOSAL_RECEIVED: 206,
  INSPECTION_COMPLETED: 207,
  PAYMENT_LINK_SHARED: 208,
  POLICY_ISSUED: 209,
  CLOSED: 210,
  INSPECTION_NOT_RECOMMENDED: 657,
  INSPECTION_EXPIRED: 217,
  CASE_PICKED: 154,
  PROPOSAL_PENDING: 221,
  INSPECTION_APPROVAL_PENDING: 222,
  DOC_PENDING: 211,
  PAYMENT_DONE: 214,
  INCOMPLETE: 218,
};

export const INSPECTION_TYPES = {
  SELF: "1",
  THIRD_PARTY: "0",
};

export const ITMS_OFFLINE_STATUS = {
  202: {
    allowedSteps: ["quotes"],
  },
  218: {
    allowedSteps: ["basicDetails", "policyDetails", "documents", "summary"],
  },
  221: {
    allowedSteps: [
      "quotes",
      "proposal",
      "nominee",
      "otherVehicleDetails",
      "documentDetails",
    ],
  },
  203: {
    allowedSteps: ["inspection", "inspectionDetails"],
    inspectionMessage: {
      0: "Thank you ! We will contact you shortly to schedule inspection.",
      1: "Thank you ! This is insurer self inspection and the inspection link will be shared within few hours.",
    },
  },
  204: {
    allowedSteps: ["inspection", "inspectionDetails"],
    inspectionMessage: {
      0: "Your inspection is scheduled, will inform you once the inspection is completed.",
      1: "Self Inspection link has been sent to customer’s mobile. Please wait while the inspection gets completed.",
    },
  },
  207: {
    allowedSteps: ["inspection", "inspectionDetails"],
    displayText:
      "If you have done your vehicle inspection, please upload the screenshot of successful inspection",
    inspectionMessage:
      "Inspection has been completed. Please wait till inspection gets recommended from Girnar Insurance.",
  },
};

export const MOTOR_OFFLINE_DOC_SLUGS = {
  PAYMENT_RECIEPT: "payment_doc_receipt",
  INSPECTION_REPORT: "inspection_report",
};

export const CASE_TYPE_MAP = {
  NEW: 1,
  USED: 2,
  ROLLOVER: 3,
  ROLLOVER_BREAKIN: 4,
  BREAKIN_GREATER_THAN_90_DAYS: 5,
};

export const CASE_TYPE_LABEL_MAP = {
  1: "New",
  2: "Used",
  3: "Renewal",
  4: "Renewal BreakIn",
  5: "BreakIn greater than 90 days",
};

export const LIFE_OFFLINE_STATUS = {
  OPS_QC: 1,
  PAYMENT: 2,
  QUOTE_REQUESTED: 3,
  POLICY_CANCELED: 4,
  BOOKED: 5,
  PROPOSAL_AND_DOC: 6,
};

export const LIFE_OFFLINE_SUB_STATUS = {
  PENDING: 11,
  RECEIVED: 12,
  APPROVED: 13,
  REJECTED: 14,
  ADD_DATA_PENDING: 15,
  ADD_DATA_RECEIVED: 16,
  LINK_REQUEST: 21,
  LINK_SHARED: 22,
  PAYMENT_CONFIRMATION_PENDING: 23,
  PAYMENT_DONE: 24,
  PAYMENT_FAILED: 25,
  RE_SHARED_PAYMENT_LINK: 26,
  REQUESTED: 31,
  SHARED: 32,
  REVISED_REQUEST: 33,
  REFUND_PENDING: 41,
  REFUND_COMPLETED: 42,
  POLICY_DOC_PENDING: 51,
  POLICY_DOC_SUBMITTED: 52,
  FORM_PENDING: 61,
};
