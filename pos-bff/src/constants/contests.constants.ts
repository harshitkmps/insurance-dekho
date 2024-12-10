import { Roles } from "@/src/constants/roles.constants";

export const CONTEST_SOURCE = "POS";

export enum PrimitiveOperators {
  EQUAL = "equal",
  NOT_EQUAL = "notEqual",
  GREATER_THAN_EQUAL_TO = "greaterThanEqualTo",
  GREATER_THAN = "greaterThan",
  LESS_THAN_EQUAL_TO = "lessThanEqualTo",
  LESS_THAN = "lessThan",
  IN = "in",
  NOT_IN = "notIn",
  CONTAINS = "contains",
  SOME = "some",
  EVERY = "every",
}

export const PRIMITIVE_OPERATOR_VS_SYMBOL = {
  [PrimitiveOperators.EQUAL]: "==",
  [PrimitiveOperators.NOT_EQUAL]: "!=",
  [PrimitiveOperators.GREATER_THAN_EQUAL_TO]: ">=",
  [PrimitiveOperators.GREATER_THAN]: ">",
  [PrimitiveOperators.LESS_THAN_EQUAL_TO]: "<=",
  [PrimitiveOperators.LESS_THAN]: "<",
  [PrimitiveOperators.IN]: "in",
  [PrimitiveOperators.NOT_IN]: "notIn",
  [PrimitiveOperators.CONTAINS]: "contains",
  [PrimitiveOperators.SOME]: "some",
  [PrimitiveOperators.EVERY]: "every",
};

export enum LogicalOperators {
  AND = "AND",
  OR = "OR",
}

export const LOGICAL_OPERATOR_DISPLAY_MAP = {
  [LogicalOperators.AND]: "&",
  [LogicalOperators.OR]: "or ",
};

export enum KpiKeys {
  PREMIUM = "premium",
  NOP = "nop",
  ACTIVATIONS = "activations",
}

export enum AchievementImageType {
  MONEY = "money",
  STAT = "stat",
}

export const KPI_VS_IMAGE_TYPE = {
  [KpiKeys.NOP]: AchievementImageType.STAT,
  [KpiKeys.ACTIVATIONS]: AchievementImageType.STAT,
  [KpiKeys.PREMIUM]: AchievementImageType.MONEY,
};

export enum Routes {
  CONTESTS_LIST = "/core/contests/list",
  CONTEST_DETAIL = "/core/contests",
  HIERARCHY_LIST = "/core/contests/hierarchy/list",
  HIERARCHY_DETAIL = "/core/contests/hierarchy",
  DASHBOARD_LIST = "/core/contests/dashboard/list",
  DASHBOARD_DETAIL = "/core/contests/dashboard",
  CREATE_CONTEST = "/core/contests/dashboard/create",
}

export enum ContestViews {
  CONTESTS_LIST = "contestsList",
  CONTEST_DETAIL = "contestDetail",
  HIERARCHY_LIST = "hierarchyList",
  HIERARCHY_DETAIL = "hierarchyDetail",
  DASHBOARD_LIST = "adminList",
  DASHBOARD_DETAIL = "adminDetail",
  CREATE_CONTEST = "createContest",
}

export const PARTICIPANTS_ROLES = [...Roles.POS_SALES_ALL, Roles.POS_AGENT];

export const ROUTES_VS_VIEW = {
  [Routes.CONTESTS_LIST]: ContestViews.CONTESTS_LIST,
  [Routes.CONTEST_DETAIL]: ContestViews.CONTEST_DETAIL,
  [Routes.HIERARCHY_LIST]: ContestViews.HIERARCHY_LIST,
  [Routes.HIERARCHY_DETAIL]: ContestViews.HIERARCHY_DETAIL,
  [Routes.DASHBOARD_LIST]: ContestViews.DASHBOARD_DETAIL,
  [Routes.DASHBOARD_DETAIL]: ContestViews.DASHBOARD_DETAIL,
};

export const VIEW_VS_ROUTES = {
  [ContestViews.CONTESTS_LIST]: Routes.CONTEST_DETAIL,
  [ContestViews.CONTEST_DETAIL]: Routes.CONTEST_DETAIL,
  [ContestViews.HIERARCHY_LIST]: Routes.HIERARCHY_DETAIL,
  [ContestViews.HIERARCHY_DETAIL]: Routes.HIERARCHY_DETAIL,
  [ContestViews.DASHBOARD_LIST]: Routes.DASHBOARD_DETAIL,
  [ContestViews.DASHBOARD_DETAIL]: Routes.DASHBOARD_DETAIL,
};

export const VIEWS_VS_ROLES = {
  [ContestViews.CONTESTS_LIST]: PARTICIPANTS_ROLES,
  [ContestViews.CONTEST_DETAIL]: PARTICIPANTS_ROLES,
  [ContestViews.HIERARCHY_LIST]: [...Roles.POS_SALES_ALL],
  [ContestViews.HIERARCHY_DETAIL]: [...Roles.POS_SALES_ALL],
  [ContestViews.DASHBOARD_LIST]: [Roles.POS_SUPER_ADMIN],
  [ContestViews.DASHBOARD_DETAIL]: [Roles.POS_SUPER_ADMIN],
  [ContestViews.CREATE_CONTEST]: [Roles.POS_SUPER_ADMIN],
};

export const VIEWS_VS_PROJECTIONS = {
  [ContestViews.CONTESTS_LIST]: "userPerfomance,totalParticipants",
  [ContestViews.CONTEST_DETAIL]: "userPerfomanceWithRank,totalParticipants",
  [ContestViews.HIERARCHY_LIST]: "totalParticipants",
  [ContestViews.HIERARCHY_DETAIL]: "totalParticipants",
  [ContestViews.DASHBOARD_DETAIL]: "totalParticipants,contestPerfomance",
  [ContestViews.DASHBOARD_LIST]: "totalParticipants,contestPerfomance",
};

export const PARTICIPANT_VIEWS = [
  ContestViews.CONTESTS_LIST,
  ContestViews.CONTEST_DETAIL,
];

export const HIERARCHY_VIEWS = [
  ContestViews.HIERARCHY_DETAIL,
  ContestViews.HIERARCHY_LIST,
];

export const SALES_REQUIRED_FIELD_PATHS = [
  "designation_id",
  "name",
  "designation_slug",
  "employee_id",
];

export enum Tabs {
  ACTIVE_CONTESTS = "activeContests",
  PAST_CONTESTS = "pastContests",
  UPCOMING_CONTESTS = "upcomingContests",
  AGENT_CONTESTS = "agentContests",
  TEAM_CONTESTS = "teamContests",
}

export const TABS_VS_VALUES = {
  [Tabs.ACTIVE_CONTESTS]: {
    label: "Active Contests",
    value: Tabs.ACTIVE_CONTESTS,
  },
  [Tabs.PAST_CONTESTS]: {
    label: "Past Contests",
    value: Tabs.PAST_CONTESTS,
  },
  [Tabs.AGENT_CONTESTS]: {
    label: "Agent Contests",
    value: Tabs.AGENT_CONTESTS,
  },
  [Tabs.TEAM_CONTESTS]: {
    label: "My Team Contests",
    value: Tabs.TEAM_CONTESTS,
  },
};

export const CONTEST_PRODUCTS_MAPPING = {
  bike: "motor",
  car: "motor",
  gcv: "motor",
  pcv: "motor",
  misc: "motor",
};

export const KURUKSHETRA_AGENT_FILTERS = [
  { startDate: "2024-11-15", endDate: "2024-12-15" },
  { startDate: "2024-12-16", endDate: "2024-12-31" },
];

export const KURUKSHETRA_AGENT_PROJECTIONS = [
  "nop_renewed",
  "nop_to_be_renewed",
];

export const SALES_ELIGIBILITY_RELEVANT_FIELDS = [
  "hierarchy",
  "uuid",
  "status",
  "state_id",
  "city_id",
  "designation_id",
  "reporting_manager_id",
  "employment_type",
  "date_of_joining",
  "designation_slug",
];
