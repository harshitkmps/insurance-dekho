/**
 * Redux Saga : "LoginListing"
 * Purpose : Generator functions that deals with ajax calls and performs followup action
 */

import { put } from "redux-saga/effects";
import * as constants from "../constants";
import { getData, postDataWithPathParams, postJsonData } from '../../utils/api.js';
import config from '../../app-configs/index';

export function* getContent(data) {
    try {
        const json = yield getData(
        config.apiBaseUrl+'/courses?',data.payload,{});
        yield put({
            type: constants.SET_CONTENT,
            json: json,
        });

    } catch (error) {
        console.log("error", error);
    }
} 

export function* getCompletionStatus(data) {
    try {
        const json = yield getData(config.apiBaseUrl+`/status/${data.payload.uuid}`,{});
        yield put({
            type: constants.SET_COMPLETION_STATUS,
            json: json,
        });

    } catch (error) {
        console.log("error", error);
    }
} 

export function* updateCompletionStatus(data) {
    try {
        //console.log(data)
        const json = yield postDataWithPathParams(config.apiBaseUrl+'/status/',data.payload.options,{},data.payload.pathParams);
        if(data.payload.updateVideoCompleted)
            data.payload.updateVideoCompleted();
    } catch (error) {
        console.log("error", error);
    }
} 

export function* getEntireContent(data) {
    try {
        const json = yield getData(config.apiBaseUrl+'/allActiveCourses',data.payload,{});
        yield put({
            type: constants.SET_CONTENT,
            json: json,
        });
    } catch (error) {
        console.log("error", error);
    }
}

export function* addCourses(data){
    try {
        //console.log(data)
        const json = yield postJsonData(config.apiBaseUrl+'/add',data.payload.options,{});
        if(data.payload.callback)
            data.payload.callback(json);
    } catch (error) {
        console.log("error", error);
    }
}

export function* deleteCourse(data){
    try {
        console.log(data)
        const json = yield postJsonData(config.apiBaseUrl+'/courses/markinactive',data.payload,{});
        yield put({type: constants.GET_ENTIRE_CONTENT});
    } catch (error) {
        console.log("error", error);
    }
}

export function* editCourse(data){
    try {
        const json = yield postJsonData(config.apiBaseUrl+'/courses/edit',data.payload,{});
        yield put({type: constants.GET_ENTIRE_CONTENT});
    } catch (error) {
        console.log("error", error);
    }
}