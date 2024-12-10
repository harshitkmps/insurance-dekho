/**
 * Redux Reducer : "LoginReducers"
 * Purpose : Reducer provides a new state after state manipulation on a certain action
 */

import * as constants from "../constants";
import configs from "../../app-configs";
let defaultState = {
  showOtp: true,
  mobileNumber: "",
  errorText: "",
  apiError: false,
  disableSubmit: false,
  loaderCls: false,
  showVerify: false,
  showResendOtpText: false,
  showTerm: false,
  isShowAllText: false,
  appEvent: "RENDER_OTP_LOGIN",
  appEventData: {},
  loginType: "otp",
};

const OTPLoginReducer = (state = defaultState, action) => {
  switch (action.type) {
    case constants.CHANGE_NUMBER:
      return {
        ...state,
        disableSubmit: false,
        loaderCls: false,
        showVerify: false,
        showOtp: true,
        errorText: "",
        apiError: false,
        appEvent: action.type,
        appEventData: {},
      };
    case constants.INITIATE_SEND_OTP:
      return {
        ...state,
        disableSubmit: true,
        loaderCls: true,
        errorText: "",
        apiError: false,
        appEvent: action.type,
        appEventData: {},
      };
    case constants.RESEND_LOGIN_OTP:
      return {
        ...state,
        disableSubmit: true,
        loaderCls: true,
        errorText: "",
        apiError: false,
        appEvent: action.type,
        appEventData: {},
      };
    case constants.SEND_LOGIN_OTP:
      return { ...state, appEvent: action.type };
    case constants.GENERATE_GOOGLE_RECAPTCHA_TOKEN:
      return { ...state, appEvent: action.type };
    case constants.OTP_SEND_FAILED:
      return {
        ...state,
        disableSubmit: false,
        loaderCls: false,
        errorText: action.payload.error || configs.globalError,
        apiError: true,
        appEvent: action.type,
        showResendOtpText: false,
        appEventData: { ...action.payload },
      };
    case constants.OTP_SEND_SUCCESS:
      return {
        ...state,
        showVerify: true,
        showOtp: false,
        disableSubmit: false,
        loaderCls: false,
        authCode: action.payload.authCode,
        showResendOtpText: !!action.payload.resend,
        appEvent: action.type,
        appEventData: { ...action.payload },
      };
    case constants.OTP_VERIFY_FAILED:
      return {
        ...state,
        disableSubmit: false,
        loaderCls: false,
        errorText: action.payload.error,
        apiError: true,
        appEvent: action.type,
        appEventData: { ...action.payload },
      };
    case constants.OTP_VERIFY_SUCCESS:
      return {
        ...state,
        appEvent: action.type,
        appEventData: { ...action.payload },
      };
    case constants.OTP_LOGIN_SUCCESS:
      return {
        ...state,
        appEvent: action.type,
        appEventData: { ...action.payload },
      };
    case constants.OTP_LOGIN_RESET:
      return { ...defaultState };
    case constants.OTP_LOGIN_FAILED:
      return {
        ...state,
        errorText: action.payload.error,
        apiError: true,
        disableSubmit: false,
        loaderCls: false,
        appEvent: action.type,
        appEventData: { ...action.payload },
      };
    case constants.VERIFY_LOGIN_OTP:
      return {
        ...state,
        disableSubmit: true,
        loaderCls: true,
        errorText: "",
        apiError: false,
        appEvent: action.type,
        appEventData: { ...action.payload },
      };
    case constants.EMIT_LOGIN_EVENT:
      return {
        ...state,
        appEvent: action.payload.appEvent,
      };
    default:
      return state;
  }
};
export default OTPLoginReducer;
