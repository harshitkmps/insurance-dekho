/**
 * Redux Saga : "LoginListing"
 * Purpose : Generator functions that deals with ajax calls and performs followup action
 */

 import { put } from "redux-saga/effects";
 import * as constants from "../constants";
 import { getData, postDataWithPathParams, postJsonData } from '../../utils/api.js';
 import config from '../../app-configs/index';
 import {checkOS} from '../../utils/globals.js';
 
 export function* getBanner(data) {
     try {
         const json = yield getData(config.apiBaseUrl+'/gamification/banners?',data.payload,{});
         yield put({
             type: constants.SET_BANNER,
             json: json,
         });
 
     } catch (error) {
         console.log("error", error);
     }
 } 
 
 export function* getCustomBanner(data) {
    try {
        //console.log(data)
        const json = yield postDataWithPathParams(config.apiBaseUrl+'/gamification/banners/custom',data.payload.options,{},[])
        if(json.code == 200){
            yield put({
                type: constants.SET_CUSTOM_BANNER,
                json: json.result,
            });
            // data.payload.setEditMenu(false);
            if(data.payload.history) { //for mobile navigation
                data.payload.history.replace("#viewbanner");
                data.payload.setEditMenu(false);
            }
            if(data.payload.setOpenModal) //for showing custom image when popup is opened
                data.payload.setOpenModal(true);
            if(data.payload.download) //Home page download
                data.payload.download(json.result);
            if(data.payload.customShare){ //For mobile share to share only the updated image
                if(window && window.Android){
                    window.Android.shareImage(json.result,"Sharing the image");
                }else if(checkOS() === "iOS"){
                    const data = JSON.stringify({ shareImage: { event_name: "Sharing_the_image", params: json.result || {} } });
                    window?.webkit?.messageHandlers?.bridge?.postMessage(data);
                }
                else {
                console.log(`system does not support sharing files.`);
                }
            }
            if(data.payload.setShowLoader){
                data.payload.setShowLoader(false);
            }
        }
        else{
            console.log('Error occur ',json)
        }
    } catch (error) {
        console.log("error", error);
    }
} 

export function* addBanner(data){
    try {
        //console.log(data)
        const json = yield postJsonData(config.apiBaseUrl+'/gamification/banners',data.payload.options,{});
        if(data.payload.callback)
            data.payload.callback(json);
    } catch (error) {
        console.log("error", error);
    }
}

export function* deleteBanner(data){
    try {
        console.log(data)
        const json = yield postJsonData(config.apiBaseUrl+'/gamification/banners/markinactive',data.payload.options,{});
        if(data.payload.callback)
            data.payload.callback();
    } catch (error) {
        console.log("error", error);
    }
}

export function* editBanner(data){
    try {
        const json = yield postJsonData(config.apiBaseUrl+'/gamification/banners/edit',data.payload.options,{});
        if(data.payload.callback)
            data.payload.callback();
    } catch (error) {
        console.log("error", error);
    }
}