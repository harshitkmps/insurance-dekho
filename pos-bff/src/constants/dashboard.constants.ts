export const PostionOfNonGeneralProducts = 2;
export const dashboardProducts = [
  "Motor",
  "Health",
  "Life",
  "Travel",
  "Pet",
  "All",
  "Card",
];

export const EXCLUDE_DASHBOARD_PRODUCTS = ["wellness", "personalLoan"];

export const SALES_AGGREGATES_PROJECTIONS = [
  "active_agents",
  "nop",
  "nop_renewed",
  "nop_to_be_renewed",
  "total_agents",
  "total_premium",
  "net_premium",
  "cc_issued_count",
  "onboarding_count",
  "reportee_count",
];

export const TARGETS_PROJECTIONS = [
  "onboarding",
  "motor_activation",
  "motor_premium",
  "health_activation",
  "health_premium",
  "life_activation",
  "life_premium",
  "motor_nop",
  "health_nop",
  "life_nop",
  "cc_issued_count",
  "motor_tw_nop",
  "motor_pc_nop",
  "motor_cv_nop",
  "health_renewal_nop",
  "motor_renewal_premium",
  "motor_tw_premium",
  "motor_pc_premium",
  "motor_cv_premium",
  // "opd",
];

export const salesHierarProjections = [
  "iam_uuid",
  "name",
  "designation_id",
  "employee_id",
  "motor_total_premium",
  "motor_net_premium",
  "overall_total_premium",
  "overall_net_premium",
  "health_total_premium",
  "health_net_premium",
  "life_total_premium",
  "life_net_premium",
  "cc_issued_count",
  "cc_application_submitted_count",
  "cc_leads_count",
  "onboarding_count",
  "motor_active_agents",
  "health_active_agents",
  "life_active_agents",
];

export const nopProjections = ["nop", "net_premium", "active_agents"];
export const creditCardDataProjection = [
  "cc_leads_count",
  "cc_application_submitted_count",
  "cc_issued_count",
];

export const vehileTypeArray = ["tw", "pv", "cv"];
export const caseTypeArray = ["Fresh", "Renewal", "All"];
export const onboardingProjections = [
  "onboarding_leads_count",
  "onboarding_pending_leads_count",
];

export const performanceOrderingPriorityMap = {
  onboarding: 1,
  motor_activation: 2,
  motor_nop: 3,
  motor_premium: 4,
  health_activation: 5,
  health_nop: 6,
  health_premium: 7,
  life_activation: 8,
  life_nop: 9,
  life_premium: 10,
};

export const fieldsForBreakup = {
  onboarding: true,
  motor_activation: true,
  motor_nop: true,
  motor_premium: true,
  health_activation: true,
  health_nop: true,
  health_premium: true,
  life_activation: false,
  life_nop: false,
  life_premium: false,
  cc_issued_count: true,
};

export const extendedNopKeys = {
  creditCards: [
    {
      nopKey: "currentRangeData",
      extendedNopKeys: ["cc_issued_count"],
    },
    {
      nopKey: "comparisionRangeData",
      extendedNopKeys: ["cc_issued_count"],
    },
  ],
  charts: [
    {
      nopKey: "userData",
      extendedNopKeys: ["cc_issued_count"],
    },
    {
      nopKey: "trendData",
      extendedNopKeys: ["cc_issued_count"],
    },
  ],
};

export const additionalProjectionLobWise = new Map();
additionalProjectionLobWise.set("all", ["cc_issued_count"]);
additionalProjectionLobWise.set("card", ["cc_issued_count"]);

export const TARGET_TIME_DURATION = {
  MTD: "monthly",
  WTD: "weekly",
  FTD: "daily",
};

export const HIERARCHY_TIME_DURATION = {
  MTD: "MTD",
  WTD: "WEEKLY",
  PMTD: "PMTD",
  FTD: "FTD",
};

export const PRODUCT_LABEL_MAP = {
  PersonalLoan: "Personal Loan",
};

export const WTD_CONFIG = [
  { startDay: 1, endDay: 8 },
  { startDay: 9, endDay: 15 },
  { startDay: 16, endDay: 22 },
  { startDay: 23, endDay: 31 },
];
export const LOB_TREND_PROJECTIONS = {
  motor: ["nop", "net_premium"],
  life: ["nop", "net_premium"],
  health: ["nop", "net_premium"],
  travel: ["nop", "net_premium"],
  card: ["nop", "net_premium"],
  pet: ["nop", "net_premium"],
  sme: ["nop", "net_premium"],
  wellness: ["nop", "net_premium"],
};

export const PRODUCT_WISE_CATEGORY = {
  motor: [
    { name: "Two Wheeler", value: "tw" },
    { name: "Private Car", value: "pv" },
    { name: "Commercial Vehicles", value: "cv" },
  ],
  health: [
    { name: "Fresh", value: "fresh" },
    { name: "Renewal", value: "renewal" },
  ],
};

export const SALES_AGGREGATES_LOB_PROJECTIONS = {
  all: [
    "active_agents",
    "total_agents",
    "onboarding_count",
    "current_month_newly_active_agents",
  ],
  motor: ["active_agents", "net_premium", "onboarding_count"],
  health: ["active_agents", "net_premium", "onboarding_count"],
  life: ["active_agents", "net_premium", "onboarding_count"],
  travel: ["active_agents", "net_premium", "onboarding_count"],
  pet: ["active_agents", "net_premium", "onboarding_count"],
  sme: ["active_agents", "net_premium", "onboarding_count"],
  card: ["active_agents", "net_premium", "onboarding_count", "cc_issued_count"],
};

export const SALES_PERFORMANCE_KEYS = [
  {
    key: "onboardingCount",
    name: "Onboarding",
  },
  {
    key: "allCurrentMonthNewlyActiveAgents",
    name: "New Activations",
  },
  {
    key: "motorActiveAgents",
    name: "Motor Activation",
  },
  {
    key: "motorNetPremium",
    name: "Motor Premium",
  },
  {
    key: "motorTwNop",
    name: "TW NOP",
  },
  {
    key: "motorTwNetPremium",
    name: "TW Premium",
  },
  {
    key: "motorPvNop",
    name: "FW NOP",
  },
  {
    key: "motorPvNetPremium",
    name: "FW Premium",
  },
  {
    key: "motorCvNop",
    name: "CV NOP",
  },
  {
    key: "motorCvNetPremium",
    name: "CV Premium",
  },
  {
    key: "healthRenewalNetPremium",
    name: "Health Renewal Premium",
  },
  {
    key: "healthFreshNetPremium",
    name: "Health Fresh Premium",
  },
  {
    key: "healthActiveAgents",
    name: "Health Activation",
  },
  {
    key: "lifeActiveAgents",
    name: "Life Activation",
  },
  {
    key: "lifeNetPremium",
    name: "Life Premium",
  },
  {
    key: "cardCcIssuedCount",
    name: "Credit Cards",
  },
];

export const ACHIEVED_TARGET_MAP = {
  onboardingCount: "onboarding",
  motorActiveAgents: "motorActivation",
  motorNetPremium: "motorPremium",
  healthActiveAgents: "healthActivation",
  healthFreshNetPremium: "healthPremium",
  lifeActiveAgents: "lifeActivation",
  lifeNetPremium: "lifePremium",
  cardCcIssuedCount: "ccIssuedCount",
  motorTwNop: "motorTwNop",
  motorTwNetPremium: "motorTwPremium",
  motorPvNop: "motorPcNop",
  motorPvNetPremium: "motorPcPremium",
  motorCvNop: "motorCvNop",
  motorCvNetPremium: "motorCvPremium",
};

export const PARTNER_BASE_COHORTS = {
  activeDealers: "activeDealers",
  onboardedButNotActive: "onboardedButNotActive",
  months1Active: "months1Active",
  months3Active: "months3Active",
  months6Active: "months6Active",
  months9Active: "months9Active",
  months12Active: "months12Active",
  irregularActive: "irregularActive",
};

export const PARTNER_COHORTS_PROJECTIONS = ["dealer_count"];

export const PARTNER_BASE_LIST_PROJECTIONS = {
  common: ["gcd_code", "iam_uuid", "name"],
  motor: ["motor_NOP", "motor_net_premium", "motor_total_premium"],
  health: ["health_NOP", "health_net_premium", "health_total_premium"],
  life: ["life_NOP", "life_net_premium", "life_total_premium"],
  travel: ["travel_NOP", "travel_net_premium", "travel_total_premium"],
  sme: ["sme_NOP", "sme_net_premium", "fire_NOP", "fire_net_premium"],
  card: ["cc_leads_count", "cc_application_submitted_count", "cc_issued_count"],
  downloadOnly: [
    "bm_name",
    "bm_emp_id",
    "srm_name",
    "am_name",
    "rgm_name",
    "sh_name",
    "nh_name",
    "zh_name",
  ],
};

export const PARTNER_COHORT_WISE_PROJECTION = {
  activeDealers: {
    allowLobWise: true,
    projections: ["overall_net_premium"],
  },
  onboardedButNotActive: {
    allowLobWise: false,
    projections: ["onboarding_date", "rm_name"],
  },
  months3Active: {
    allowLobWise: true,
    projections: ["overall_net_premium"],
  },
  months6Active: {
    allowLobWise: true,
    projections: ["overall_net_premium"],
  },
  months9Active: {
    allowLobWise: true,
    projections: ["overall_net_premium"],
  },
  months12Active: {
    allowLobWise: true,
    projections: ["overall_net_premium"],
  },
  months1Active: {
    allowLobWise: true,
    projections: ["overall_net_premium"],
  },
  irregularActive: {
    allowLobWise: true,
    projections: ["overall_net_premium"],
  },
};

export const PARTNER_BASE_DEALERS_COLUMNS = {
  default: {
    overall_net_premium: "Total Premium",
    motor_net_premium: "Motor MTD",
    health_net_premium: "Health MTD",
    life_net_premium: "Life MTD",
    travel_net_premium: "Travel MTD",
    pet_net_premium: "Pet MTD",
    sme_net_premium: "SME MTD",
    motor_net_premium_pmtd: "Motor PMTD",
    health_net_premium_pmtd: "Health PMTD",
    life_net_premium_pmtd: "Life PMTD",
    travel_net_premium_pmtd: "Travel PMTD",
    pet_net_premium_pmtd: "Pet PMTD",
    sme_net_premium_pmtd: "SME PMTD",
    cc_leads_count: "Card Lead MTD",
    cc_leads_count_pmtd: "Card Lead PMTD",
    cc_application_submitted_count: "Card Submitted MTD",
    cc_application_submitted_count_pmtd: "Card Submitted PMTD",
    cc_issued_count: "Card Issued MTD",
    cc_issued_count_pmtd: "Card Issued PMTD",
  },
  onboardedButNotActive: {
    onboarding_date: "Onboarding Date",
    rm_name: "RM assigned",
  },
  months3Active: {
    overall_net_premium: "Total Premium",
    motor_net_premium: "Motor",
    health_net_premium: "Health",
    life_net_premium: "Life",
    travel_net_premium: "Travel",
    pet_net_premium: "Pet",
    sme_net_premium: "SME",
    cc_leads_count: "Card Lead",
    cc_application_submitted_count: "Card Submitted",
    cc_issued_count: "Card Issued",
  },
  months6Active: {
    overall_net_premium: "Total Premium",
    motor_net_premium: "Motor",
    health_net_premium: "Health",
    life_net_premium: "Life",
    travel_net_premium: "Travel",
    pet_net_premium: "Pet",
    sme_net_premium: "SME",
    cc_leads_count: "Card Lead",
    cc_application_submitted_count: "Card Submitted",
    cc_issued_count: "Card Issued",
  },
  months9Active: {
    overall_net_premium: "Total Premium",
    motor_net_premium: "Motor",
    health_net_premium: "Health",
    life_net_premium: "Life",
    travel_net_premium: "Travel",
    pet_net_premium: "Pet",
    sme_net_premium: "SME",
    cc_leads_count: "Card Lead",
    cc_application_submitted_count: "Card Submitted",
    cc_issued_count: "Card Issued",
  },
  months12Active: {
    overall_net_premium: "Total Premium",
    motor_net_premium: "Motor",
    health_net_premium: "Health",
    life_net_premium: "Life",
    travel_net_premium: "Travel",
    pet_net_premium: "Pet",
    sme_net_premium: "SME",
    cc_leads_count: "Card Lead",
    cc_application_submitted_count: "Card Submitted",
    cc_issued_count: "Card Issued",
  },
  irregularActive: {
    overall_net_premium: "Total Premium",
    motor_net_premium: "Motor",
    health_net_premium: "Health",
    life_net_premium: "Life",
    travel_net_premium: "Travel",
    pet_net_premium: "Pet",
    sme_net_premium: "SME",
    cc_leads_count: "Card Lead",
    cc_application_submitted_count: "Card Submitted",
    cc_issued_count: "Card Issued",
  },
};

export const PARTNER_BASE_DOWNLOAD_COLUMNS = {
  name: "name",
  gcd_code: "GCD Code",
  bm_name: "BM Name",
  bm_emp_id: "BM Emp ID",
  srm_name: "SRM Name",
  am_name: "AM Name",
  rgm_name: "Regional Manager Name",
  sh_name: "SH Name",
  zh_name: "ZH Name",
  nh_name: "NH Name",
};
