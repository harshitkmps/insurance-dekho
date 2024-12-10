/**
 * Redux Actions : "GoogleLoginAction"
 * Purpose : Defines state manipulation functions to components
 */

import * as constants from "../constants";

export const logout = (payload) => {
  return { type: constants.INITIATE_LOGOUT, payload: payload };
};
