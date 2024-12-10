import DateTimeUtils from "./date-time-utils";
import {
  MeetingStatus,
  createQuoteUrl,
  ctaHealthMapping,
  ctaText,
  familyMemberValues,
  leadDataConstant,
  meetingDataConstant,
} from "../constants/fusion.constants";
import moment from "moment";

// here we return the create or view quotes by checking the lead step value
// LEAD_DROPPED_STEP-> value shows the highest step value where the customer dropped.
// url_name-> where customer has dropped and it has values like quote_listing, payment_pending
export const quoteSection = (lead: any) => {
  let key = null;
  let value = null;

  if (lead.step < leadDataConstant.LEAD_DROPPED_STEP) {
    key = MeetingStatus.CREATE_QUOTES;
    value = ctaText.CREATE_QUOTES;
  } else if (
    lead.step === leadDataConstant.LEAD_DROPPED_STEP &&
    lead.url_name
  ) {
    key = MeetingStatus.VIEW_QUOTES;
    value = `${ctaHealthMapping[lead.url_name]?.cta_label}`;
  }
  const quotesDataArray = [{ key, value }];
  return quotesDataArray;
};

//return true if current time has exceed the meeting done time(45 min)
export const isCurrentTimeExceedMeetingDoneTime = (time: any) => {
  const minutes = DateTimeUtils.calculateTimeDifferenceInMinutesFromNow(time);
  return minutes <= -meetingDataConstant.MEETIND_DONE_TIME;
};
// check that if current time has exceed the meeting time
export const checkIfMeetingTimePassed = (time: any) => {
  const minutes = DateTimeUtils.calculateTimeDifferenceInMinutesFromNow(time);
  return minutes <= 0;
};
// convert UTC time format to IST
export const convertTimeUTCToIST = (time: any) => {
  return moment(time).format("llll");
};
// check if the meetingTime is in the 1 hour duration before and after of current time
export const checkMeetingTimeInHourDuration = (time: any) => {
  const minutes = DateTimeUtils.calculateTimeDifferenceInMinutesFromNow(time);
  if (
    minutes <= meetingDataConstant.MEETINGTIME &&
    minutes >= -meetingDataConstant.MEETINGTIME
  ) {
    return true;
  }
  return false;
};

//set the create or view quotes url
export const setRedirectURL = (lead: any) => {
  if (lead?.step === leadDataConstant.LEAD_DROPPED_STEP) {
    const ctaUrl = lead.url_name
      ? `${ctaHealthMapping[lead.url_name].link}${lead._id}`
      : null;
    return ctaUrl;
  }
  return createQuoteUrl;
};

// set the visibility of primary and secondary cta chekcing the condition
export const isBtnVisible = (lead: any) => {
  return ![
    ctaText.CLOSED,
    ctaText.TO_BE_RESCHEDULE,
    ctaText.PAYMENT_DONE,
  ].includes(lead?.meeting_details?.meeting_status_display_name);
};

// set the family member array value by checking the member data object
export const setMemberText = (data: any) => {
  const memberDetails = data?.groups?.[1]?.member_details;
  const insuredMemberArr = [familyMemberValues.SELF];
  if (memberDetails?.spouse) {
    insuredMemberArr.push(familyMemberValues.SPOUSE);
  }
  if (memberDetails?.child_1 && memberDetails?.child_2) {
    insuredMemberArr.push(familyMemberValues.KIDS);
  } else if (memberDetails?.child_1) {
    insuredMemberArr.push(familyMemberValues.KID);
  }
  return insuredMemberArr;
};

// this function check if sub status is equal to confirmation_due
export const checkConfirmationDueCase = (prmSubStatus: string) => {
  return prmSubStatus === MeetingStatus.CONFIRMATION_DUE;
};

export const getDisplayNameMeetingStatus = (meetingDetails: any) => {
  if (
    meetingDetails &&
    !meetingDetails.is_meeting_verified &&
    meetingDetails.meeting_sub_status_slug === "scheduled"
  ) {
    return "upcoming";
  }
  if (meetingDetails.meeting_status_display_name === "followup") {
    if (meetingDetails?.follow_up_info?.follow_up_type) {
      if (meetingDetails.follow_up_info.follow_up_type === "payment") {
        return "payment followup";
      }
      return "meeting followup";
    }
  }
  return meetingDetails.meeting_status_display_name;
};
