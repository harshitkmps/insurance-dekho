import * as constants from "../constants";

export const getIdExclusiveBanner = (payload) => ({
  type: constants.GET_ID_EXCLUSIVE_BANNER,
  payload,
});

export const setIdExclusiveBanner = (payload) => ({
  type: constants.SET_ID_EXCLUSIVE_BANNER,
  payload,
});

export const addIdExclusiveBanner = (payload) => ({
  type: constants.ADD_ID_EXCLUSIVE_BANNER,
  payload,
});

export const deleteIdExclusiveBanner = (payload) => ({
  type: constants.DELETE_ID_EXCLUSIVE_BANNER,
  payload,
});

export const editIdExclusiveBanner = (payload) => ({
  type: constants.EDIT_ID_EXCLUSIVE_BANNER,
  payload,
});

export const addIdExclusiveBannerStatus = (payload) => ({
  type: constants.ADD_ID_EXCLUSIVE_BANNER_STATUS,
  payload,
});

export const editIdExclusiveBannerStatus = (payload) => ({
  type: constants.EDIT_ID_EXCLUSIVE_BANNER_STATUS,
  payload,
});

export const deleteIdExclusiveBannerStatus = (payload) => ({
  type: constants.DELETE_ID_EXCLUSIVE_BANNER_STATUS,
  payload,
});

export const getTenantsList = () => ({ type: constants.GET_TENANTS_LIST });

export const setTenantsList = (payload) => ({
  type: constants.SET_TENANTS_LIST,
  payload,
});
