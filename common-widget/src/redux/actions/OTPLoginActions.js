/**
 * Redux Actions : "OTPLoginAction"
 * Purpose : Defines state manipulation functions to components
 */

import * as constants from "../constants";

export const initiateSendOtp = (payload) => {
  return { type: constants.INITIATE_SEND_OTP, payload: payload };
};

export const resendLoginOtp = (payload) => {
  return { type: constants.RESEND_LOGIN_OTP, payload: payload };
};

export const sendLoginOtp = (payload) => {
  return { type: constants.SEND_LOGIN_OTP, payload: payload };
};

export const changeNumber = (payload) => {
  return { type: constants.CHANGE_NUMBER, payload: payload };
};

export const otpSendSuccess = (payload) => {
  return { type: constants.OTP_SEND_SUCCESS, payload: payload };
};

export const otpSendFailed = (payload) => {
  return { type: constants.OTP_SEND_FAILED, payload: payload };
};

export const verifyLoginOtp = (payload) => {
  return { type: constants.VERIFY_LOGIN_OTP, payload: payload };
};

export const emitLoginEvent = (payload) => {
  return { type: constants.EMIT_LOGIN_EVENT, payload: payload };
};
