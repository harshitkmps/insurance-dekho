import { Roles } from "../constants/roles.constants";

export const PostionOfNonGeneralProducts = 2;

export const SalesRoleId = Roles.POS_SALES_ALL;

export const LMW_PRODUCT_SLUGS = [
  "motor",
  "health",
  "life",
  "travel",
  "pet",
  "fire",
  "specificMarine",
  "sme",
  "wellness",
  "workmenCompensation",
  "professionalIndemnity",
  "groupHealth",
];

export const VehicleTypesVsLabel = {
  1: "Bike",
  2: "Car",
  8: "PCV",
  9: "GCV",
  4: "Misc",
};

export const VehicleTypes = {
  Bike: "1",
  Car: "2",
  PCV: "8",
  GCV: "9",
  Misc: "4",
};

export const VehicleTypesVsQuotesPagePrefix = {
  1: "twoWheeler",
  2: "fourWheeler",
  8: "commercial",
  9: "commercial",
  4: "commercial",
};

export const BucketMapping = {
  offlineQuotes: "offline_quotes",
  proposalPending: "proposal_pending",
  documentPending: "document_pending",
  paymentPending: "payment_pending",
  bookingPending: "booking_pending",
  issued: "issued",
  inspection: "inspection",
  quoteListing: "quote_listing",
  insuredDetails: "insured_details",
  paymentDone: "payment_done",
  upcoming: "upcoming",
  missed: "missed",
  gracePeriod: "grace_period",
  lost: "lost",
  allLead: "all_leads",
  application: "application",
  approvedInPrinciple: "approved_in_principle",
  rejected: "reject",
  closed: "closed",
};

export const CaseListingProduct = {
  general: [
    "Car",
    "Health",
    "Travel",
    // "Pet",
    // "Fire",
    // "SpecificMarine",
    // "Sme",
    // "Wellness",
    // "WorkmenCompensation",
  ],
  nonGeneral: ["Life"],
};

export const CaseListingProductFilters = {
  Motor: {
    buckets: [
      { key: "quoteListing", value: "Quotes" },
      { key: "proposalPending", value: "Proposal" },
      { key: "documentPending", value: "Document" },
      { key: "paymentPending", value: "Payment" },
      { key: "paymentDone", value: "Booking" },
      { key: "issued", value: "Issued" },
      { key: "inspection", value: "Inspection" },
    ],
    secondaryFilter: {
      required: true,
      title: "Vehicle Type",
      key: "vehicleType",
      data: [
        { label: "All", value: 0 },
        { label: "Car", value: 2 },
        { label: "Bike", value: 1 },
        { label: "PCV", value: 8 },
        { label: "GCV", value: 9 },
        { label: "Misc", value: 4 },
      ],
    },
    tertiaryFilter: [
      {
        title: "Case Medium",
        key: "policyMedium",
        type: "Radio",
        data: [
          { label: "Online", value: "online" },
          { label: "Offline", value: "offline" },
        ],
      },
      {
        title: "Case Type",
        key: "caseType",
        type: "Radio",
        data: [
          { label: "New", value: "New" },
          { label: "Renewal", value: "Renewal" },
          { label: "Rollover", value: "Rollover" },
          { label: "RolloverBreakIn", value: "RolloverBreakIn" },
          { label: "Used", value: "Used" },
        ],
      },
    ],
  },
  Health: {
    buckets: [
      { key: "quoteListing", value: "Quote" },
      { key: "proposalPending", value: "Proposal" },
      { key: "paymentPending", value: "Payment" },
      { key: "paymentDone", value: "Booking" },
      { key: "issued", value: "Issued" },
    ],
    secondaryFilter: {
      required: true,
      title: "Case Type",
      key: "caseType",
      data: [
        { label: "New", value: "New" },
        { label: "Renewal", value: "Renewal" },
        { label: "Port", value: "Port" },
      ],
    },
    tertiaryFilter: [
      {
        title: "Business Type",
        key: "businessType",
        type: "Radio",
        data: [
          { label: "New", value: "New" },
          { label: "Renewal", value: "Renewal" },
          { label: "Port", value: "Port" },
        ],
      },
      {
        title: "Coverage",
        key: "coverage",
        type: "Radio",
        data: [
          { label: "3 Lacs", value: "300000" },
          { label: "5 Lacs", value: "500000" },
          { label: "10 Lacs", value: "1000000" },
        ],
      },
    ],
  },
  Life: {
    buckets: [
      { key: "quoteListing", value: "Quote" },
      { key: "proposalPending", value: "Insured Details" },
      { key: "paymentPending", value: "Payment" },
      { key: "paymentDone", value: "Booking" },
      { key: "issued", value: "Issued" },
    ],
    secondaryFilter: {
      required: true,
      key: "productType",
      title: "Case Type",
      data: [
        { label: "Investment", value: "investment" },
        { label: "Term", value: "term" },
      ],
    },
    tertiaryFilter: [
      {
        title: "Plan Type",
        key: "planType",
        type: "Radio",
        data: [
          { label: "Term", value: "term" },
          { label: "Traditional", value: "traditional" },
          { label: "Ulip", value: "ulip" },
        ],
      },
      {
        title: "Coverage",
        key: "coverage",
        type: "Radio",
        data: [
          { label: "1 Cr", value: "10000000" },
          { label: "1.5 Cr", value: "15000000" },
          { label: "2 Cr", value: "20000000" },
          { label: "2.5 Cr", value: "25000000" },
        ],
      },
    ],
  },
  Travel: {
    buckets: ["Quote", "Insured Details", "Payment", "Booking", "Issued"],
    secondaryFilter: { required: false, title: "", data: [] },
    tertiaryFilter: [],
  },
  Pet: {
    buckets: ["Quote", "Insured Details", "Payment", "Booking", "Issued"],
    secondaryFilter: { required: false, title: "", data: [] },
    tertiaryFilter: [],
  },
  Fire: {
    buckets: ["Quote", "Insured Details", "Payment", "Booking", "Issued"],
    secondaryFilter: { required: false, title: "", data: [] },
    tertiaryFilter: [],
  },
  SpecificMarine: {
    buckets: ["Quote", "Insured Details", "Payment", "Booking", "Issued"],
    secondaryFilter: { required: false, title: "", data: [] },
    tertiaryFilter: [],
  },
};

export const CaseListingProjectionFields = {
  motor: [
    "customerName",
    "mobileNumber",
    "caseType",
    "regNumber",
    "vehicleType",
    "vehicleSubType",
    "vehicleMMV",
    "gcdCode",
    "insurerId",
    "premium",
    "policyNumber",
  ],
  health: [
    "customerName",
    "mobileNumber",
    "caseType",
    "planType",
    "planName",
    "insurerId",
    "insurerName",
    "sumAssured",
    "premium",
    "policyNumber",
    "tenure",
  ],
  life: [
    "customerName",
    "mobileNumber",
    "caseType",
    "planType",
    "planName",
    "insurerId",
    "insurerName",
    "sumAssured",
    "premium",
    "policyNumber",
    "proposalNumber",
  ],
  travel: [
    "customerName",
    "mobileNumber",
    "caseType",
    "city",
    "insurerId",
    "insurerName",
    "sumAssured",
    "premium",
    "insuredMembers",
  ],
  pet: [
    "customerName",
    "mobileNumber",
    "caseType",
    "planType",
    "breedName",
    "insurerId",
    "insurerName",
    "sumAssured",
    "premium",
    "policyNumber",
  ],
  fire: [
    "customerName",
    "mobileNumber",
    "insurerId",
    "insurerName",
    "sumAssured",
    "premium",
    "policyNumber",
    "proposalNumber",
    "gcdCode",
    "caseType",
  ],
  specificMarine: [
    "customerName",
    "mobileNumber",
    "insurerId",
    "insurerName",
    "sumAssured",
    "premium",
    "policyNumber",
    "proposalNumber",
    "gcdCode",
    "caseType",
  ],
};

export const CaseListingUrl = "/core/case-listing";
export const OldPosCaseListingUrl = "inspection/cases";
export const OldPosAppCaseListingUrl = "/policies/pending";
export const posBaseUrl = "https://posstaging.insurancedekho.com";
export const posAppBaseUrl = "https://posstaging.insurancedekho.com";
export const healthRenewalNoticeUrl =
  "https://healthleadstage.insurancedekho.com/health/leads/lead-details";
export const motorRenewalNoticeUrl =
  "https://leadmiddlewarestaging.insurancedekho.com/api/v1/lead/";

export const PremiumLabelMapping = {
  Premium: "Total Premium",
};

export const itmsSubStatusVsSlug = {
  174: "Policy Doc Pending",
};

export const CasesUpdates = {
  ITMS_STATUS: {
    MOTOR_OFFLINE: "155,211,213,205",
    MOTOR_ONLINE: "164,189",
    HEALTH_PAYMENT_PENDING: "677",
  },
  LIMIT: 15,
};

export const PolicyMedium = {
  ONLINE: "online",
  OFFLINE: "offline",
};

export const SME = "SME";
export const CAMEL_CASE_PRODUCT_TYPES = ["grouphealth"];

export const REMOVE_DATE_RANGE_KEYS = ["policyNumber", "searchValue"];

export const WELLNESS = "wellness";
export const RENEWAL_FOMO_UPCOMING_END_DATE = 6;
export const RENEWAL_FOMO_MISSED_END_DATE = 30;
export const RENEWAL_FOMO_DROP_MULTIPLIER = 0.89;

export const SME_SLUGS_TO_NAME = {
  fire: "Fire & Burglary",
  marineHull: "Marine Hull",
  specificMarine: "Specific Marine",
  stop: "STOP",
  openMarine: "Open Marine",
  homePackage: "Home Insurance",
  shopkeeper: "Shopekeeper Policy",
  officePackage: "Office Package",
  cgl: "Commercial General Liability",
  dno: "Directors and Officers Liability Insurance",
  publicLiability: "Public Liability",
  professionalIndemnity: "Professional Indenmnity",
  eno: "Errors and Omissions Insurance",
  cyber: "Cyber Insurance",
  productLiability: "Product Liability",
  liabilityInsuranceMisc: "Liability Insurance Miscellaneous",
  contractors: "Contractors' All Risk",
  cpm: "Contractors Plant & Machinery",
  erection: "Erection All Risk (EAR)",
  burglary: "Burglary",
  money: "Money",
  miscellaneous: "Fire and Burglary Miscellaneous",
  machinery: "Machinery Breakdown Damage",
  workmenCompensation: "Workmen Compensation",
};

export const CaseListingDownloadConfigKeys = {
  motor: "cases",
  health: "cases",
  life: "cases",
  travel: "cases",
  hospicash: "cases",
  pet: "cases",
  sme: "cases",
  wellness: "cases",
  card: "cardCases",
};

export const CaseListingDownloadTransformData = {
  motor: false,
  health: false,
  life: false,
  travel: false,
  hospicash: false,
  pet: false,
  sme: false,
  wellness: false,
  card: true,
};

export const RENEWAL_CASE_LISTING_CTA_TEXT = {
  PAY_ON_INSURER_WEBSITE: "Pay On Insurer Website",
  RENEW_NOW: "Renew Now",
};
