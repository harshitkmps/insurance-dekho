/**
 * Redux Actions : "OTPLoginAction"
 * Purpose : Defines state manipulation functions to components
 */

import * as constants from "../constants";

export const initReactFormBuilder = (payload) => {
  return { type: constants.INIT_RFB, payload: payload };
};

export const updateFieldValue = (payload) => {
  return { type: constants.UPDATE_FIELD_VALUE, payload: payload };
};

export const goBack = (payload) => {
  return { type: constants.GO_BACK, payload: payload };
};
