import ContextHelper from "./helpers/context-helper";
import HealthLeadService from "./health-lead.service";
import CommonApiHelper from "./helpers/common-api-helper";
import ConfigService from "./config-service";
import { Injectable, Logger } from "@nestjs/common";
import {
  MeetingStatus,
  ctaText,
  config as fusionConfig,
  currToNextPrmCTaMapping,
  secondaryStatusSection,
  ctaHealthMapping,
  moreSubSectionForLastFlow,
  moreSubSection,
  createQuoteUrl,
  defaultSuccessMsg,
  toastMsgForDash,
  toastMsgForPrmAct,
  toastMsgForSecAct,
  meetingDataConstant,
  meetingErrorMsg,
  primaryCtaSubStatusValues,
  defaultMeetingType,
  leadErrorMsg,
} from "../constants/fusion.constants";
import DateTimeUtils from "../utils/date-time-utils";
import moment from "moment";
import {
  checkConfirmationDueCase,
  checkIfMeetingTimePassed,
  checkMeetingTimeInHourDuration,
  isBtnVisible,
  isCurrentTimeExceedMeetingDoneTime,
  quoteSection,
  setMemberText,
  setRedirectURL,
  convertTimeUTCToIST,
  getDisplayNameMeetingStatus,
} from "../utils/fusion-utils";
import { config } from "../constants/config.constants";
import ApiPosService from "./apipos-service";

@Injectable()
export default class FusionService {
  constructor(
    private apiHelper: CommonApiHelper,
    private configService: ConfigService,
    private healthLeadService: HealthLeadService,
    private apiPosService: ApiPosService
  ) {}

  public async checkLeadInDuration(leads: any[]): Promise<any> {
    const leadArray = [];
    for (const lead of leads) {
      const dateTime = lead.meeting_details.meeting_datetime;
      const statusName = lead.meeting_details.meeting_status_display_name;
      const isFollwUp = lead?.meeting_details?.follow_up_info;
      const date = new Date(dateTime);
      const nowTime = new Date();
      const diff = date.valueOf() - nowTime.valueOf();
      const minutes = Math.floor(diff / (60 * 1000));
      this.constructRedirectUrl(lead);
      if (
        minutes <= meetingDataConstant.MEETINGTIME &&
        minutes >= -meetingDataConstant.MEETINGTIME &&
        (statusName == MeetingStatus.UPCOMING ||
          statusName == MeetingStatus.IN_PROGRESS ||
          statusName == MeetingStatus.CONFIRMED)
      ) {
        Logger.debug("lead matched for popup");
        lead.meetingDate = moment(lead.meeting_details.meeting_datetime)
          .add(5, "hours")
          .add(30, "minutes")
          .format("llll");
        leadArray.unshift(lead);
      }
      if (isFollwUp) {
        Logger.debug("lead matched for followup meeting");
        const followUpDate = new Date(
          lead?.meeting_details?.follow_up_info?.meeting_start_time
        );
        const followUpTimediff = followUpDate.valueOf() - nowTime.valueOf();
        const followUpMinutes = Math.floor(followUpTimediff / (60 * 1000));

        if (
          followUpMinutes <= meetingDataConstant.FOLLOWUPTIME &&
          followUpMinutes >= -meetingDataConstant.FOLLOWUPTIME &&
          statusName === MeetingStatus.FOLLOWUP
        ) {
          lead.meetingDate = moment(lead.meeting_details.meeting_datetime)
            .add(5, "hours")
            .add(30, "minutes")
            .format("llll");
          leadArray.push(lead);
        }
      }
    }
    return leadArray;
  }
  // this function will set the button logic data and filter the data
  public async filterAndSetBtnLogicData(leads: any[]): Promise<any> {
    const meetingData = this.setButtonLogicData(leads);

    const filteredMeetingData = this.filterMeetingData(meetingData);

    return filteredMeetingData;
  }

  //function here to filter or remove the redundent key in lead obj and add a key insurerMemberArray
  public filterMeetingData = (leads: any[]) => {
    const leadArray = [];
    for (const lead of leads) {
      lead.insuredMemberArr = setMemberText(lead);
      lead.meeting_details.meeting_datetime_ist = convertTimeUTCToIST(
        lead.meeting_details.meeting_datetime
      );
      lead.meeting_details.meeting_status_display = getDisplayNameMeetingStatus(
        lead.meeting_details
      );
      if (lead?.meeting_details?.follow_up_info) {
        const followUpInfo = lead.meeting_details.follow_up_info;
        followUpInfo.meeting_start_time = DateTimeUtils.addIST(
          followUpInfo.meeting_start_time
        );
        followUpInfo.meeting_end_time = DateTimeUtils.addIST(
          followUpInfo.meeting_end_time
        );
      }
      this.constructRedirectUrl(lead);

      delete lead.groups;
      delete lead.step;
      delete lead.url_name;
      delete lead.existing_disease;
      leadArray.push(lead);
    }
    return leadArray;
  };

  public constructRedirectUrl(lead) {
    if (lead?.meeting_details?.lat && lead?.meeting_details?.long) {
      lead.meeting_details.isLatLong = 1;

      lead.meeting_details.redirectUrltoMaps = `${meetingDataConstant.GOOGLE_MAPS_DIRECTION_URL}${lead?.meeting_details?.lat},${lead?.meeting_details?.long}`;
    }
  }
  // set the updated success message(toast message to show on the frontend) once meeting status update to health lead
  public updateSuccessMsg = (lead: any, fromHomePage: boolean) => {
    let updatedSuccessMsg = "";
    const meetingDetails = lead?.meeting_details;
    if (!meetingDetails) {
      Logger.error(meetingErrorMsg.meetingDataNotFound);
      throw {
        message: meetingErrorMsg.meetingDataNotFound,
        status: 500,
        code: "Internal Server Error",
      };
    }
    const { meeting_status_slug: status, meeting_sub_status_slug: subStatus } =
      meetingDetails;

    // here if the meeting_status is pre_meeting then set the toast message for primary action else secondary action
    if (status === MeetingStatus.PRE_MEETING) {
      updatedSuccessMsg = fromHomePage
        ? toastMsgForDash[subStatus]
        : toastMsgForPrmAct[subStatus];
    } else {
      updatedSuccessMsg = toastMsgForSecAct[status] || defaultSuccessMsg;
    }

    return updatedSuccessMsg;
  };
  /* primary and seconadary button logic data function
  primary button CTA => we show this button on the meeting section(POS-APP) at the left side of meeting card to manage the meeting status.
  secondary button CTA => we show this button on the meeting section(POS-APP) at the left side of meeting card to manage the meeting status.
  */
  public setButtonLogicData = (leads: any[]) => {
    const leadArray = [];
    for (const lead of leads) {
      try {
        lead.buttons = this.setButtonStatusSubStatus(lead);
        leadArray.push(lead);
      } catch (error) {
        Logger.error("error in setButtonLogic Data: ", error);
      }
    }
    return leadArray;
  };

  public setButtonStatusSubStatus = (lead: any) => {
    const buttons = {
      primaryCTA: {},
      secondaryCTA: {},
    };
    // here prmCta and updateStatusBtn-> this two variable's value decide the primaryCTA and secondaryCTA CTA text and status
    // sub_status flow values. If prmCTa doesn't have value then updateStatusBtn value is true we show Meeting Done or Update Status
    // text on the prmCta and the status marking flow will work on the prmCTa click.
    const meetingDetails = lead.meeting_details;
    if (!meetingDetails) {
      Logger.error(meetingErrorMsg.meetingDataNotFound);
      throw {
        message: meetingErrorMsg.meetingDataNotFound,
        status: 500,
        code: "Internal Server Error",
      };
    }
    const {
      meeting_datetime: meetingDatetime,
      meeting_status_slug: prmStatus,
      meeting_sub_status_slug: prmSubStatus,
    } = meetingDetails;
    const isMeetingVerified = meetingDetails.is_meeting_verified ?? true;

    //meeting done time is 45 mins greater than meeting time
    const isMeetingOver = isCurrentTimeExceedMeetingDoneTime(meetingDatetime);

    // setting isMeetingTimePassed variable value by checking the time difference b/w cuurent time and meeting time
    const isMeetingTimePassed = checkIfMeetingTimePassed(meetingDatetime);

    const prmSubStatusExist = primaryCtaSubStatusValues[prmSubStatus] || false;

    //it checks whether the lead meeting status is not started.
    const checkSubStatusNotStarted =
      prmSubStatusExist && prmSubStatus !== MeetingStatus.STARTED;

    let prmCtaFlag = false;
    let prmCta = "";

    if (prmSubStatusExist) {
      prmCta = currToNextPrmCTaMapping(lead)[prmSubStatus]?.value;
      prmCtaFlag = true;
    }
    if (checkConfirmationDueCase(prmSubStatus)) {
      prmCtaFlag = true;
    } else if (
      prmSubStatus === MeetingStatus.SCHEDULED &&
      !checkMeetingTimeInHourDuration(meetingDatetime) &&
      isMeetingVerified
    ) {
      prmCtaFlag = false;
    }

    // setting the isMeetingDone by checking the meeting time over and meeting started
    const isMeetingDone =
      isMeetingOver && prmCtaFlag && prmSubStatus == MeetingStatus.STARTED;

    let isMeetingStarted = false;
    if (isMeetingTimePassed && checkSubStatusNotStarted) {
      isMeetingStarted = true;
      prmCta =
        currToNextPrmCTaMapping(lead)[MeetingStatus.REACHED_LOCATION].value;
      prmCtaFlag = true;
    }
    const showMoreMeetingHeadersInSubpopup =
      (isMeetingTimePassed || prmSubStatus == MeetingStatus.STARTED) &&
      !isMeetingOver;

    let updateStatusBtn = false;

    if (
      !prmCtaFlag ||
      (prmStatus === MeetingStatus.FOLLOWUP &&
        !checkConfirmationDueCase(prmSubStatus)) ||
      (isMeetingTimePassed && !checkSubStatusNotStarted && isMeetingOver)
    ) {
      updateStatusBtn = true;
    }

    // primary btn cta logic
    buttons.primaryCTA = this.setPrimaryBtnData(
      isMeetingVerified,
      lead,
      isMeetingTimePassed,
      prmCta,
      prmCtaFlag,
      isMeetingDone,
      updateStatusBtn,
      prmSubStatus,
      prmStatus,
      isMeetingStarted
    );

    // secondary btn cta logic
    buttons.secondaryCTA = this.setSecondaryBtnData(
      lead,
      prmSubStatus,
      updateStatusBtn,
      showMoreMeetingHeadersInSubpopup
    );

    return buttons;
  };

  public setPrimaryBtnData = (
    isMeetingVerified: boolean,
    lead: any,
    isMeetingTimePassed: boolean,
    prmCta: string,
    prmCtaFlag: boolean,
    isMeetingDone: boolean,
    updateStatusBtn: boolean,
    prmSubStatus: string,
    prmStatus: string,
    isMeetingStarted: boolean
  ) => {
    const renderConfirmFlow =
      !isMeetingVerified &&
      (!isMeetingTimePassed || checkConfirmationDueCase(prmSubStatus));

    let prmCtaText = "";
    let updateStatusCall = false;
    let redirectOnClick = false;
    if (renderConfirmFlow && !updateStatusBtn) {
      prmCtaText = ctaText.CONFIRM_MEETING;
      updateStatusCall = true;
    } else {
      if (prmCtaFlag) {
        prmCtaText = isMeetingDone
          ? ctaText.MEETING_DONE
          : prmCta || ctaText.UPDATE_STATUS;
        updateStatusCall = prmCta && !isMeetingDone ? true : false;
      } else {
        prmCtaText = isMeetingDone
          ? ctaText.MEETING_DONE
          : ctaText.UPDATE_STATUS;
        updateStatusCall = false;
      }
    }

    let newSubStatus: string;
    let newStatus: string;

    if (renderConfirmFlow) {
      if (checkConfirmationDueCase(prmSubStatus)) {
        newSubStatus =
          lead?.meeting_details?.follow_up_info?.previous_sub_status;
        newStatus = lead?.meeting_details?.follow_up_info?.previous_status;
      } else {
        newSubStatus = prmSubStatus;
        newStatus = prmStatus;
      }
    } else {
      newStatus = currToNextPrmCTaMapping(lead)?.[prmSubStatus]?.status;
      newSubStatus = isMeetingStarted
        ? currToNextPrmCTaMapping(lead)?.[MeetingStatus.REACHED_LOCATION]?.key
        : currToNextPrmCTaMapping(lead)?.[prmSubStatus]?.key;
    }

    if (newSubStatus === MeetingStatus.VIEW_QUOTES && !updateStatusBtn) {
      redirectOnClick = true;
      updateStatusCall = false;
    }
    // creating the primaryBtnData object
    const primaryBtnDataObj = this.setPrimaryBtnObj(
      lead,
      newStatus,
      newSubStatus,
      prmCtaText,
      updateStatusCall,
      redirectOnClick,
      updateStatusBtn,
      prmSubStatus
    );
    return primaryBtnDataObj;
  };

  public setPrimaryBtnObj = (
    lead: object,
    newStatus: any,
    newSubStatus: any,
    prmCtaText: string,
    updateStatusCall: boolean,
    redirectOnClick: boolean,
    updateStatusBtn: any,
    prmSubStatus: any
  ) => {
    const primaryDataObj = {
      isVisible: isBtnVisible(lead),
      ctaText: prmCtaText,
      status: newStatus,
      sub_status: newSubStatus,
      updateStatusCall: updateStatusCall,
      redirectOnClick: redirectOnClick,
      options: {
        redirectURL: "",
        statusOptions: [],
      },
    };
    if (redirectOnClick) {
      primaryDataObj.options.redirectURL = setRedirectURL(lead);
    } else {
      if (updateStatusBtn) {
        const statusOptions = [];
        for (const updateSecData of secondaryStatusSection) {
          statusOptions.push(
            this.setStatusStructure(updateSecData, lead, prmSubStatus)
          );
        }
        primaryDataObj.options.statusOptions = statusOptions;
      }
    }
    return primaryDataObj;
  };

  public setSecondaryBtnData = (
    lead: any,
    subStatus: string,
    updateStatusBtn: boolean,
    showMoreMeetingHeadersInSubpopup: boolean
  ) => {
    let secBtnDataObj = {};
    // onclick more(secondary) button, the more section data will be render
    let moreSectionData = [];
    const isStarted = subStatus === MeetingStatus.STARTED;

    // quote Section - here we render the create or view quotes data based on the condition
    if (updateStatusBtn) {
      moreSectionData = quoteSection(lead);
    } else {
      if (isStarted) {
        moreSectionData = [
          ...(showMoreMeetingHeadersInSubpopup
            ? secondaryStatusSection
            : quoteSection(lead)),
        ];
      } else {
        moreSectionData = [...quoteSection(lead), ...secondaryStatusSection];
      }
    }
    const statusOptions = [];
    for (const moreData of moreSectionData) {
      statusOptions.push(this.setStatusStructure(moreData, lead, subStatus));
    }
    // creating the secondaryButtonData Object
    secBtnDataObj = this.setSecondaryBtnObj(lead, statusOptions);
    return secBtnDataObj;
  };
  public setSecondaryBtnObj = (lead: any, statusOptions: any[]) => {
    const secDataObj = {
      isVisible: isBtnVisible(lead),
      ctaText: "More",
      status: "",
      sub_status: "",
      updateStatusCall: false,
      redirectOnClick: false,
      options: {
        statusOptions: statusOptions,
      },
    };
    return secDataObj;
  };
  // here we are creating the status structure obj using the given data
  public setStatusStructure = (
    moreData: { key: any; value: any },
    lead: any,
    subStatus: string
  ) => {
    const statusOptions = {
      key: moreData.key,
      value: moreData.value,
      status: moreData.key,
      updateStatusCall:
        moreData.key ===
        (MeetingStatus.LEFT_FOR_MEET || MeetingStatus.PAYMENT_DONE),
      redirectOnClick: false,
      subStatusOptions: [],
      options: {
        redirectURL: "",
      },
    };

    const handleRedirect = (url: string) => {
      statusOptions.options.redirectURL = url;
      statusOptions.redirectOnClick = true;
    };

    switch (moreData.key) {
      case MeetingStatus.VIEW_QUOTES: {
        const ctaUrl = lead.url_name
          ? `${ctaHealthMapping[lead.url_name].link}${lead._id}`
          : "";
        handleRedirect(ctaUrl);
        break;
      }
      case MeetingStatus.PAYMENT_DONE: {
        statusOptions.key = moreData.key;
        break;
      }
      case MeetingStatus.CREATE_QUOTES: {
        handleRedirect(createQuoteUrl);
        break;
      }
      default:
        const followUpType =
          lead?.meeting_details?.follow_up_info?.follow_up_type || "";

        if (
          subStatus === MeetingStatus.STARTED ||
          followUpType === MeetingStatus.PAYMENT
        ) {
          statusOptions.subStatusOptions =
            moreSubSectionForLastFlow[moreData.key] || [];
        } else {
          statusOptions.subStatusOptions = moreSubSection[moreData.key] || [];
        }
    }
    return statusOptions;
  };

  public async getAgentAvailableTimeSlots(lead_id: string): Promise<any> {
    const params = {
      channel: fusionConfig.channel,
      source: fusionConfig.source,
      sub_source: fusionConfig.sub_source,
      medium: fusionConfig.medium,
      product: fusionConfig.product,
      type: fusionConfig.type,
      lead_id,
      reschedule: true,
    };
    const options = {
      endpoint: process.env.API_FUSION_ENDPOINT + `/fusion/meeting/time-slots`,
      timeout: 5000,
    };
    const response: any = await this.apiHelper.fetchData(options, params);
    Logger.debug("get time slots response", response);
    return response.data;
  }

  public async fetchMeetingDataByVisitId(visitId: string): Promise<any> {
    const params = {
      visit_id: visitId,
    };
    const options = {
      endpoint: `${process.env.API_LMW_HEALTH_URL}/health/leads/meeting/leadDetails`,
    };
    const response: any = await this.apiHelper.fetchData(options, params);
    Logger.debug("response received from fetchMeetingDataByVisitId API");
    return response.result;
  }

  public async sendOtpToCustomer(body: Object): Promise<any> {
    const options = {
      endpoint: `${process.env.API_LMW_HEALTH_URL}/health/leads/fusion/send-otp`,
    };
    Logger.debug("send otp to customer inside service", { body });
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug("response received from send otp to customer");
    return response.result;
  }

  public async fetchSharedPlans(params: any): Promise<any> {
    const options = {
      endpoint: `${process.env.API_LMW_HEALTH_URL}/health/leads/getSharePlansByVisitId`,
    };
    const response: any = await this.apiHelper.fetchData(options, params);
    return response.result;
  }

  /**
   * Retrieves all Lines of Business (LOBs) for the Fusion Agent based on user information and request origin.
   * @param userInfo - User information object containing details like tenant_id.
   * @param requestOrigin - The origin of the request (e.g., a web page or application).
   * @returns A Promise resolving to an object containing Fusion Agent configuration data.
   */

  public async getAllLOBsForFusionAgent(
    userInfo: any,
    requestOrigin: string
  ): Promise<any> {
    userInfo.tenant_id = userInfo.tenant_id || 1;
    // Fetch configuration values asynchronously using Promise.all to parallelize requests.
    const [insuranceLobsConfig, otherProductLobs, eligibleRMList] =
      await Promise.all([
        this.configService.getConfigValueByKey(config.INSURANCE_FUSION_LOBS),
        this.configService.getConfigValueByKey(config.OTHER_PRODUCT_LOBS),
        this.configService.getConfigValueByKey(
          config.ELIGIBLE_RM_FOR_CREDIT_CARD
        ),
      ]);
    // Fetch and check insuranceLobConfig and otherProductsConfig based on conditions.
    const [insuranceLobConfig, otherProductsConfig] = [
      this.configService.checkConfigArrOfConditions(
        insuranceLobsConfig,
        userInfo,
        requestOrigin
      ),
      this.configService.checkUserProperties(
        otherProductLobs,
        userInfo,
        eligibleRMList
      ),
    ];

    // Filter otherProductsLobs based on conditions.
    const filteredOtherProductsLobs =
      this.configService.checkConfigArrOfConditions(
        otherProductsConfig,
        userInfo,
        requestOrigin
      );

    // Modify links in insuranceLobConfig and filteredOtherProductsLobs with a subSource parameter.
    const addSubSourceToLinks = (lobs: any[]) => {
      return lobs.map((lob) =>
        lob.link ? { ...lob, link: `${lob.link}?subSource=FUSION` } : lob
      );
    };

    const insuranceLobConfigWithSubSource =
      addSubSourceToLinks(insuranceLobConfig);
    const filteredOtherProductsLobsWithSubSource = addSubSourceToLinks(
      filteredOtherProductsLobs
    );

    // Combine insuranceLobConfig and filteredOtherProductsLobs into configData.insuranceLobs.
    const combinedInsuranceLobs = [
      ...(insuranceLobConfigWithSubSource ?? []),
      ...(filteredOtherProductsLobsWithSubSource ?? []),
    ];

    return { fusionConfig: { insuranceLobs: combinedInsuranceLobs } };
  }

  public async getFusionMeetingDataFromLMW(
    userInfo: any,
    query: any,
    fromHomePage: any
  ) {
    try {
      const {
        offset,
        limit,
        meetingStartDate,
        meetingEndDate,
        meeting_type_filter: meetingTypeFilter,
        searchCustName,
      } = query;

      Logger.debug("get fusion meetings data controller request query", {
        offset,
        limit,
        meetingStartDate,
        meetingEndDate,
        gcd_code: userInfo?.gcd_code,
      });

      const meetingsScheduleParams = {
        agent_id: userInfo?.user_id,
        meeting_start_date: meetingStartDate || "",
        meeting_end_date: meetingEndDate || "",
        offset: offset || meetingDataConstant.MIN_MEETING_OFFSET,
        limit: limit || meetingDataConstant.MAX_MEETING_LIMIT,
        gcd_code: userInfo?.gcd_code,
        meeting_type_filter: meetingTypeFilter || defaultMeetingType,
      };

      if (searchCustName) {
        meetingsScheduleParams["searchCustName"] = searchCustName;
      }

      const callingAbilityParams = {
        gcdCode: userInfo?.gcd_code,
      };

      const config = {
        headers: {
          Authorization: ContextHelper.getStore().get("authorization"),
        },
      };

      const [schedule, callingAbility] = await Promise.all([
        this.healthLeadService.getFusionMeetingSchedule(meetingsScheduleParams),
        callingAbilityParams.gcdCode
          ? this.apiPosService.checkCallingAbility(callingAbilityParams, config)
          : {},
      ]);

      let leadData = schedule?.leads;
      let meetingData = [];

      if (leadData?.length) {
        if (fromHomePage) {
          leadData = await this.checkLeadInDuration(leadData);
        }
        meetingData = await this.filterAndSetBtnLogicData(leadData);
      }

      const responseResult = {
        count: schedule?.count ?? null,
        ...callingAbility,
        leads: meetingData,
      };
      return responseResult;
    } catch (err) {
      Logger.error("error in fetching the Fusion Meetings scheduled data", {
        err,
      });
      throw err;
    }
  }

  public async updateMeetingStatus(body: any) {
    try {
      const updatedDataResponse =
        await this.healthLeadService.updateMeetingStatus(body);
      if (!updatedDataResponse?.lead_id) {
        throw { status: 400, message: leadErrorMsg.leadIdNotExist };
      }
      const leadData = await this.fetchMeetingDataByVisitId(
        updatedDataResponse.lead_id
      );
      if (!leadData?.lead) {
        throw { status: 400, message: leadErrorMsg.leadDataNotFound };
      }

      const updateSuccessMsg = this.updateSuccessMsg(
        leadData.lead,
        body.fromHomePage
      );

      // this function will filter thre data and set the button logic data
      const meetingData = this.filterAndSetBtnLogicData([leadData.lead]);

      return {
        successMsg: updateSuccessMsg,
        updatedLeadData: meetingData?.[0],
      };
    } catch (err) {
      Logger.error("Error updating meeting status", { err });
      throw err;
    }
  }
}
