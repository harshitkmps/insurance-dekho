import config from '../app-configs/index';
import {get} from 'lodash';
import axios from "axios";

export function getLocalStorageItem(key) {
    if (typeof window.localStorage !== 'undefined') {
        let data = localStorage.getItem(key);
        if (typeof data !== 'undefined' && data != 'undefined' && data != undefined) {
            let obj = JSON.parse(localStorage.getItem(key));
            return obj;
        }
    }
    return {};
}
export function isProduct(key) {
    if(typeof window != 'undefined' && window.location && window.location.pathname){
        let pathName = window.location.pathname;  
        if(pathName.includes(key)) {
            return true
        } else{
            return false;
        }    
    }
    return false;
}
export function formatDate(datetime,format){           
            
    if(datetime == "" || datetime == undefined){
        return "-";
    }    
    let dateLocale = {
        month_names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        month_names_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        days : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    };    
    let date    = new Date(datetime);
    let month_short = dateLocale.month_names_short[date.getMonth()];
    let month_long = dateLocale.month_names[date.getMonth()];
    let week_day =  dateLocale.days[date.getDay()];
    let monthData =  date.getMonth()+1;
    let yr    = date.getFullYear();            
    let month    = monthData < 10 ? '0'+monthData : monthData;            
    let day     = date.getDate()  < 10 ? '0' + date.getDate()  : date.getDate();
    let newDate = "";
    var hours = date.getHours() ; // gives the value in 24 hours format
    var hour= hours; // assign the value of 24 hours format
    var AmOrPm = hours >= 12 ? 'PM' : 'AM';
    hours = (hours % 12) || 12;
    var minutes = date.getMinutes() ;
    minutes = minutes <10?`0${parseInt(minutes)}`:minutes ;
    
    if(format == "d-m-Y"){
        newDate = `${day}-${month}-${yr}`;
    }else if(format == "d sm Y"){
        newDate = `${day} ${month_short} ${yr}`;
    }else if(format == "d/sm/Y"){
        newDate = `${day}/${month_short}/${yr}`;
    }else if(format == "d lm Y"){
        newDate = `${day} ${month_long} ${yr}`;
    }else if(format == "Y-m-d"){
        newDate = `${yr}-${month}-${day}`;
    }else if(format == "Y-m"){
        newDate = `${yr}-${month}`;
    }else if(format == "Y"){
        newDate = `${yr}`;
    }else if(format == "M"){
        newDate = `${month}`;
    }else if(format == "d lm"){
        newDate = `${day} ${month_long}`;
    }else if(format == "d sm"){
        newDate = `${day} ${month_short}`;
    }else if(format == "d/m/Y"){
        newDate = `${day}/${month}/${yr}`;
    }else if(format == "sm Y"){
        newDate = `${month_short} ${yr}`;
    }else if(format == "sm"){
        newDate = `${month_short}`;
    }else if(format == "sm d, Y h:m"){
        newDate = `${month_short} ${day}, ${yr} ${hours}:${minutes} ${AmOrPm}`;
    }else if(format == "d w"){
        newDate = `${day} ${week_day}`;
    }else if(format == "d M w"){
        newDate = `${day} ${month_short} ${week_day}`;
    }else if(format == "d M"){
        newDate = `${day} ${month_short}`;
    }else if(format == "w"){
        newDate = `${week_day}`;
    }else if(format == "h"){
        newDate = `${hour}`;    
    }else{
        newDate = yr + '-' + month + '-' + day;
    }
    return newDate;

} 

export function getQueryParams(key){
    if(typeof window != 'undefined' && window.location){
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let value = urlParams.get(key);
        if(value && value.includes('?')){
            let id = value.split('?');
            value = id[0]
        }
        return value;
    }
    return null;
}
export function removeParams(params){
    if(typeof window != 'undefined' && window.location){
        const cLocation = window.location.href;
        let url = new URL(cLocation);
        if(Array.isArray(params)){
            params.forEach((item)=>{
                let search_params = url.searchParams;
                search_params.delete(item);
            });
        }
        return url;
    }
    return null;
}
export function setLocalStorageItem(key, obj){
    if (typeof window.localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(obj));
    }
  }
export function setSessionStorageItem(key, obj){
    if (typeof window.sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, JSON.stringify(obj));
    }
}
export function getSessionStorageItem(key) {
    if (typeof window.sessionStorage !== 'undefined') {
        let data = sessionStorage.getItem(key);
        if (typeof data !== 'undefined' && data != 'undefined' && data != undefined) {
            if(!data.includes(':')){
                return data;
            }
            let obj = JSON.parse(sessionStorage.getItem(key));
            return obj;
        }
    }
    return '';
}

export function toCapitalizeFirstLetter(str) {

    let convertedString = str.toLowerCase().replace(/\b[a-z]/g, function (letter) {
        return letter.toUpperCase();
    });
    convertedString = convertedString.replaceAll("_"," ");
    if(convertedString && convertedString.toLowerCase().includes('pan')){
        let pattern = /pan/i;
        convertedString = convertedString.toLowerCase().replace(pattern, "PAN");
    }
    return convertedString;
}

export async function uploadDocument(file){
    let formData = new FormData();
    formData.append("file", file);
    let url = config.kycApiBaseUrl + '/v2/kyc/document-upload';
    let result = await axios.post(url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
    if(get(result,'data.data.metaData.code') == 200){
        return {doc_id:result?.data?.data?.doc_id,status:200};
    }
    else{
        return result;
    }
}

export function checkStepsToShow(kycConfig,typeOfKyc,typeOfDoc,stepToShow){
    let result = 0;
    let indexOfDoc = get(kycConfig,`insurer_document_config.${typeOfKyc}`,[]).findIndex((item)=>item.document_slug == typeOfDoc);
    let pageFields = get(kycConfig,`insurer_document_config.${typeOfKyc}[${indexOfDoc}].fields`);
    let pageImageField = get(kycConfig,`insurer_document_config.${typeOfKyc}[${indexOfDoc}].options`);
    pageFields.forEach((item)=>{
        if(item.step == stepToShow)
            result=1;
    });
    pageImageField.forEach((item)=>{
        if(item.step == stepToShow)
            result=1;
    })
    return result;
}

export function checkOS(){
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
      return "Android";
    }

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS";
    }

    return "unknown";
}