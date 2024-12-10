export const bannerFields = [
  {
    title: "App Banner Image Link",
    key: "appBannerLink",
    value: "",
    type: "textField",
    required: true,
  },
  {
    title: "Web Banner Image Link",
    key: "webBannerLink",
    value: "",
    type: "textField",
    required: true,
  },
  {
    title: "App Banner CTA",
    key: "appBannerCta",
    value: "",
    type: "textField",
    required: false,
  },
  {
    title: "Web Banner CTA",
    key: "webBannerCta",
    value: "",
    type: "textField",
    required: false,
  },
  {
    title: "Should Show Banner Popup on Login?",
    type: "radioBtn",
    key: "loginBanner",
    value: "",
    defaultValue: false,
    options: [
      {
        key: true,
        value: "Yes",
      },
      {
        key: false,
        value: "No",
      },
    ],
  },
  {
    title: "Visible to:",
    type: "multiSelectDropdown",
    key: "pos_role_id",
    criteria: true,
    condition: true,
    value: [],
    defaultValue: "All",
    options: [
      {
        key: 1,
        value: "SuperAdmin",
      },
      {
        key: 2,
        value: "Admin",
      },
      {
        key: 3,
        value: "Agent",
      },
      {
        key: 4,
        value: "SubAgent",
      },
      {
        key: 5,
        value: "Executive",
      },
      {
        key: 6,
        value: "Compliance",
      },
      {
        key: 7,
        value: "Finance",
      },
      {
        key: 8,
        value: "BM",
      },
      {
        key: 9,
        value: "AM",
      },
      {
        key: 10,
        value: "RH",
      },
      {
        key: 11,
        value: "ZH",
      },
      {
        key: 12,
        value: "NH",
      },
      {
        key: 13,
        value: "Caller",
      },
    ],
  },
  {
    title: "Select Date Range",
    type: "dateRange",
    key: "viewDateRange",
    value: {
      startDate: new Date(),
      endDate: new Date(),
      key: "dateRange",
    },
  },
  {
    title: "Tenants:",
    type: "multiSelectDropdown",
    key: "tenant_id",
    criteria: true,
    condition: true,
    value: [],
    defaultValue: "All",
    options: [],
  },
  {
    title: "Is IRDA?",
    type: "singleSelectDropdown",
    key: "irda_id",
    criteria: true,
    condition: true,
    value: "",
    options: [
      {
        key: "notNull",
        value: "Yes",
      },
      {
        key: "null",
        value: "No",
      },
      {
        key: "all",
        value: "All",
      },
    ],
  },
  {
    title: "Master/RAP?",
    type: "singleSelectDropdown",
    key: "refer_dealer_id",
    criteria: true,
    condition: true,
    value: "",
    options: [
      {
        key: "null",
        value: "Master",
      },
      {
        key: "notNull",
        value: "RAP",
      },
      {
        key: "all",
        value: "All",
      },
    ],
  },
  {
    title: "Retail/Aggregator?",
    type: "singleSelectDropdown",
    key: "channel_partner_sub_type",
    criteria: true,
    condition: true,
    value: "",
    options: [
      {
        key: "1",
        value: "Retail",
      },
      {
        key: "2",
        value: "Aggregator",
      },
      {
        key: "all",
        value: "All",
      },
    ],
  },
  {
    title: "GI Enabled?",
    type: "singleSelectDropdown",
    key: "onboarded_on_general",
    criteria: true,
    condition: true,
    value: "",
    options: [
      {
        key: 1,
        value: "Yes",
      },
      {
        key: 0,
        value: "No",
      },
      {
        key: "all",
        value: "All",
      },
    ],
  },
  {
    title: "LI Enabled?",
    type: "singleSelectDropdown",
    key: "eligible_for_life",
    criteria: true,
    condition: true,
    value: "",
    options: [
      {
        key: 1,
        value: "Yes",
      },
      {
        key: "null",
        value: "No",
      },
      {
        key: "all",
        value: "All",
      },
    ],
  },
];
