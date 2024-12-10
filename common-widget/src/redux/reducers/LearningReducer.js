/**
 * Redux Reducer : "LoginReducers"
 * Purpose : Reducer provides a new state after state manipulation on a certain action
 */

 import * as constants from "../constants";
 let defaultState = {};
 
 const LearningReducer = (state = defaultState, action) => {
   switch (action.type) {
     case constants.GET_CONTENT:
       return {
         ...state,
         moduleName: action.payload.moduleName,
         moduleOptions: action.payload.moduleOptions,
       };
     case constants.SET_CONTENT:
         return{
            ...state,
            videos:action.json,
         };
     case constants.GET_COMPLETION_STATUS:
         return{
             ...state,
         }
     case constants.SET_COMPLETION_STATUS:
         return{
             ...state,
             videoStatus:action.json,
         }
     case constants.UPDATE_COMPLETION_STATUS:
         return{
             ...state
         }
     default:
       return state;
   }
 };
 export default LearningReducer;
 