/**
 * Redux Actions : "CommonActions"
 * Purpose : Defines state manipulation functions to components
 */

 import * as constants from "../constants";

 export const getBanner = (payload) => {
   return { type: constants.GET_BANNER, payload: payload };
 };
 
 export const getCustomBanner = (payload) => {
  return { type: constants.GET_CUSTOM_BANNER, payload: payload };
};

export const resetCustomBanner = (payload) => {
  return { type: constants.RESET_CUSTOM_BANNER, payload: payload };
};

export const addBanner = (payload) => {
  return { type: constants.ADD_BANNER, payload: payload };
};

export const deleteBanner = (payload) => {
  return { type: constants.DELETE_BANNER, payload: payload };
};

export const editBannerCategory = (payload) => {
  return { type: constants.EDIT_BANNER, payload: payload };
};