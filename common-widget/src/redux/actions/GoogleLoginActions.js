/**
 * Redux Actions : "GoogleLoginAction"
 * Purpose : Defines state manipulation functions to components
 */

import * as constants from "../constants";

export const validateGoogleLogin = (payload) => {
  return { type: constants.VALIDATE_GOOGLE_LOGIN, payload: payload };
};
