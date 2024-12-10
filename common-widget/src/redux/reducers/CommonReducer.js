/**
 * Redux Reducer : "LoginReducers"
 * Purpose : Reducer provides a new state after state manipulation on a certain action
 */

import * as constants from "../constants";
let defaultState = {};

const CommonReducer = (state = defaultState, action) => {
  switch (action.type) {
    case constants.SET_MODULE_OPTIONS:
      return {
        ...state,
        moduleName: action.payload.moduleName,
        moduleOptions: action.payload.moduleOptions,
      };

    default:
      return state;
  }
};
export default CommonReducer;
