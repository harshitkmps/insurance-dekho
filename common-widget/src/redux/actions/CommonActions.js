/**
 * Redux Actions : "CommonActions"
 * Purpose : Defines state manipulation functions to components
 */

import * as constants from "../constants";

export const setModuleOptions = (payload) => {
  return { type: constants.SET_MODULE_OPTIONS, payload: payload };
};
