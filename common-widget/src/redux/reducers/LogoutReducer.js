/**
 * Redux Reducer : "LoginReducers"
 * Purpose : Reducer provides a new state after state manipulation on a certain action
 */

import * as constants from "../constants";
let defaultState = {
  appEvent: "RENDER_LOGOUT",
  appEventData: {},
};

const LogoutReducer = (state = defaultState, action) => {
  switch (action.type) {
    case constants.INITIATE_LOGOUT:
      return {
        ...state,
      };
    case constants.LOGOUT_SUCCESS:
      return {
        ...state,
        appEvent: action.type,
        appEventData: { ...action.payload },
      };
    case constants.LOGOUT_RESET:
      return {
        ...defaultState,
      };
    case constants.LOGOUT_FAILED:
      return {
        ...state,
        appEvent: action.type,
        appEventData: { ...action.payload },
      };
    default:
      return state;
  }
};
export default LogoutReducer;
