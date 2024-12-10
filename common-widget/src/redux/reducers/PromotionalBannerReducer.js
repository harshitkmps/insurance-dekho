/**
 * Redux Reducer : "LoginReducers"
 * Purpose : Reducer provides a new state after state manipulation on a certain action
 */

import * as constants from "../constants";
let defaultState = {};

const PromotionalBannerReducer = (state = defaultState, action) => {
  switch (action.type) {
    case constants.GET_BANNER:
      return {
        ...state,
        moduleName: action.payload.moduleName,
        moduleOptions: action.payload.moduleOptions,
      };
    case constants.SET_BANNER:
      return {
        ...state,
        banners: action.json,
      };
    case constants.GET_CUSTOM_BANNER:
      return {
        ...state,
      };
    case constants.SET_CUSTOM_BANNER:
      return {
        ...state,
        customBanner: action.json,
      };
    case constants.RESET_CUSTOM_BANNER:
      return {
        ...state,
        customBanner: "",
      };
    default:
      return state;
  }
};
export default PromotionalBannerReducer;
