export const MeetingStatus = {
  UPCOMING: "Upcoming",
  IN_PROGRESS: "In progress",
  LEFT_FOR_MEET: "left_for_meet",
  STARTED: "started",
  PAYMENT_DONE: "payment_done",
  CONFIRMED: "Confirmed",
  FOLLOWUP: "followup",
  REACHED_LOCATION: "reached_location",
  VIEW_QUOTES: "view_quotes",
  PAYMENT: "payment",
  CREATE_QUOTES: "create_quotes",
  PRE_MEETING: "pre_meeting",
  CONFIRMATION_DUE: "confirmation_due",
  SCHEDULED: "scheduled",
  RESCHEDULE_REQUEST: "reschedule_request",
  CLOSED: "closed",
};
export const ctaText = {
  MEETING_DONE: "Meeting Done",
  UPDATE_STATUS: "Update Status",
  CONFIRM_MEETING: "Confirm Meeting",
  RESCHEDULE: "Reschedule",
  FOLLOWUP: "Followup",
  CLOSED: "Closed",
  CREATE_QUOTES: "Create Quotes",
  VIEW_QUOTES: "View Quotes",
  TO_BE_RESCHEDULE: "To be Rescheduled",
  PAYMENT_DONE: "Payment Done",
  CONTINUE_PROPOSAL: "Continue Proposal",
  MAKE_PAYMENT: "Make Payment",
  LEFT_FOR_MEET: "Left for Visit",
  REACHED_LOCATION: "Reached Location",
  STARTED_HOME_VISIT: "Started Home Visit",
};
export const config = {
  channel: "pos_frontend",
  source: "AGENCY",
  sub_source: "FUSION",
  medium: "AGENT-APP",
  product: "health",
  type: "meetings",
};
export const meetingDataConstant = {
  FOLLOWUPTIME: 15,
  MEETINGTIME: 60,
  MEETIND_DONE_TIME: 45,
  MAX_MEETING_LIMIT: 10,
  MIN_MEETING_OFFSET: 0,
  GOOGLE_MAPS_DIRECTION_URL:
    "https://www.google.com/maps/dir/?api=1&destination=",
};
export const leadDataConstant = {
  LEAD_DROPPED_STEP: 4,
};
export const leadErrorMsg = {
  leadIdNotExist: "Invalid request, lead_id not found",
  leadDataNotFound: "Invalid request, lead data not found",
};
export const meetingErrorMsg = {
  meetingDataNotFound: "Meeting Details Not Found for the lead",
};
// mapping to store the primary CTA sub_status
export const primaryCtaSubStatusValues = {
  [MeetingStatus.SCHEDULED]: true,
  [MeetingStatus.LEFT_FOR_MEET]: true,
  [MeetingStatus.REACHED_LOCATION]: true,
  [MeetingStatus.STARTED]: true,
};

export const defaultMeetingType = "all";

// toats msg for all the secondary cta sub_status marking
export const toastMsgForSecAct = {
  [MeetingStatus.RESCHEDULE_REQUEST]:
    "The home visit is successfully rescheduled. Best of Luck!",
  [MeetingStatus.FOLLOWUP]:
    "We’ve received the followup request. Our team will update on this soon.",
  [MeetingStatus.CLOSED]:
    "The customer visit has been closed. Thanks for your support!",
  [MeetingStatus.PAYMENT_DONE]:
    "Great! The payment has been marked done. Thanks for your support.",
};
// toats msg for all the primary cta sub_status marking
export const toastMsgForPrmAct = {
  [MeetingStatus.SCHEDULED]:
    "Awesome! The home visit is confirmed. Best of Luck!",
  [MeetingStatus.LEFT_FOR_MEET]:
    "Awesome! You have left for the visit. Please keep updating your progress.",
  [MeetingStatus.REACHED_LOCATION]:
    "Great! You have reached the location. Please keep updating your progress.",
  [MeetingStatus.STARTED]: "The home visit has started. Best of Luck!",
};
// toats msg for all the primary cta sub_status marking on the homePage
export const toastMsgForDash = {
  [MeetingStatus.LEFT_FOR_MEET]: "You have left for the visit!",
  [MeetingStatus.REACHED_LOCATION]: " You have reached location!",
  [MeetingStatus.STARTED]: "Good luck for the home visit!",
};
// default successMSg return when we don't find a status mapping as mention above
export const defaultSuccessMsg = "Meeting Status Marked SuccessFully";

// all the status-sub_status mapping to render the data onclick of secondary CTA
export const moreSubSection = {
  [MeetingStatus.RESCHEDULE_REQUEST]: [
    {
      key: "rescheduled_partner_initiated_customer_not_available",
      value: "Customer is not available",
    },
    {
      key: "rescheduled_partner_initiated_i_am_not_available",
      value: "I am not available",
    },
    {
      key: "rescheduled_partner_initiated_others_reschedule",
      value: "Others",
    },
  ],
  [MeetingStatus.FOLLOWUP]: [
    {
      key: "customer_is_requesting_callback",
      value: "Customer is requesting callback",
    },
    {
      key: "customer_unreachable",
      value: "Customer is unreachable",
    },
    {
      key: "customer_is_not_responding",
      value: "Customer is not responding",
    },
    {
      key: "others",
      value: "Others",
    },
  ],
  [MeetingStatus.CLOSED]: [
    {
      key: "b2b_reference_not_interested",
      value: "Customer is not interested",
    },
    {
      key: "purchased_from_somewhere_else",
      value: "Customer bought elsewhere",
    },
    {
      key: "not_eligible",
      value: "Customer is not eligible",
    },
    {
      key: "price_too_high",
      value: "Price is high for customer",
    },
  ],
};
// all the status-sub_status mapping to render the data onclick of secondary CTA when meeting is already started
export const moreSubSectionForLastFlow = {
  [MeetingStatus.RESCHEDULE_REQUEST]: [
    {
      key: "rescheduled_partner_initiated_customer_needs_more_info_reschedule",
      value: "Customer needs another meeting",
    },
    {
      key: "rescheduled_partner_initiated_customer_not_available",
      value: "Customer is not available",
    },
    {
      key: "rescheduled_partner_initiated_others_reschedule",
      value: "Others",
    },
  ],
  [MeetingStatus.FOLLOWUP]: [
    {
      key: "payment_due",
      value: "Payment Due",
    },
    {
      key: "customer_is_requesting_callback",
      value: "Customer is requesting callback",
    },
    {
      key: "customer_needs_more_time",
      value: "Customer needs more time",
    },
    {
      key: "customer_unreachable",
      value: "Customer is unreachable",
    },
    {
      key: "customer_is_not_responding",
      value: "Customer is not responding",
    },
    {
      key: "others",
      value: "Others",
    },
  ],
  [MeetingStatus.CLOSED]: [
    {
      key: "b2b_reference_not_interested",
      value: "Customer is not interested",
    },
    {
      key: "purchased_from_somewhere_else",
      value: "Customer bought elsewhere",
    },
    {
      key: "not_eligible",
      value: "Customer is not eligible",
    },
    {
      key: "price_too_high",
      value: "Price is high for customer",
    },
  ],
};
// status data to render on click of update status cta click as needed
export const secondaryStatusSection = [
  {
    key: MeetingStatus.RESCHEDULE_REQUEST,
    value: ctaText.RESCHEDULE,
  },
  {
    key: MeetingStatus.FOLLOWUP,
    value: ctaText.FOLLOWUP,
  },
  {
    key: MeetingStatus.CLOSED,
    value: ctaText.CLOSED,
  },
];

export const healthurlKey = "/posui/health-insurance";
export const createQuoteUrl = "/posui/health-insurance/quotes";

// different lead status mapping with respective button CTA and redirection URL
export const ctaHealthMapping = {
  quote_listing: {
    cta_label: ctaText.VIEW_QUOTES,
    link: `${healthurlKey}/quotes?request=`,
  },
  proposal_pending: {
    cta_label: ctaText.CONTINUE_PROPOSAL,
    link: `${healthurlKey}/checkout?leadId=`,
  },
  payment_pending: {
    cta_label: ctaText.MAKE_PAYMENT,
    link: `${healthurlKey}/confirm?leadId=`,
  },
};

// status- sub_status mapping for the primary CTA logic
export const currToNextPrmCTaMapping = (lead: any) => {
  return {
    scheduled: {
      key: MeetingStatus.LEFT_FOR_MEET,
      value: ctaText.LEFT_FOR_MEET,
    },
    left_for_meet: {
      key: MeetingStatus.REACHED_LOCATION,
      value: ctaText.REACHED_LOCATION,
    },
    reached_location: {
      key: MeetingStatus.STARTED,
      value: ctaText.STARTED_HOME_VISIT,
    },
    started: {
      key: MeetingStatus.VIEW_QUOTES,
      value:
        lead && lead.step === leadDataConstant.LEAD_DROPPED_STEP
          ? lead.url_name
            ? `${ctaHealthMapping[lead.url_name].cta_label}`
            : null
          : ctaText.CREATE_QUOTES,
    },
  };
};

export const familyMemberValues = {
  SELF: "Self",
  SPOUSE: "Spouse",
  KID: "Kid",
  KIDS: "Kids",
};
