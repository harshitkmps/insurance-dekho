/**
 * Redux Actions : "CommonActions"
 * Purpose : Defines state manipulation functions to components
 */

 import * as constants from "../constants";

 export const getContent = (payload) => {
   return { type: constants.GET_CONTENT, payload: payload };
 };
 
 export const getCompletionStatus = (payload) => {
  return { type: constants.GET_COMPLETION_STATUS, payload: payload };
};

export const updateCompletionStatus = (payload) => {
  return { type: constants.UPDATE_COMPLETION_STATUS, payload: payload };
};

export const getEntireContent = (payload) => {
  return { type: constants.GET_ENTIRE_CONTENT, payload: payload };
}

export const addCourse = (payload) => {
  return { type: constants.ADD_COURSE, payload: payload };
}

export const deleteCourse = (payload) => {
  return { type: constants.DELETE_COURSE, payload: payload };
}

export const editCourse = (payload) => {
  return { type: constants.EDIT_COURSE, payload: payload };
}