import { put } from "redux-saga/effects";
import * as constants from "../constants";
import config from '../../app-configs/index';
import { postJsonData, getData } from "../../utils/api";
import {setSessionStorageItem , getQueryParams,isProduct, getSessionStorageItem, getLocalStorageItem} from "../../utils/globals"
import appConfigs from "../../app-configs/index";
import {get} from 'lodash';

let request = getQueryParams('request');
let lmsProduct = getQueryParams('product');
let leadId = getQueryParams('leadId');
leadId = (leadId)?leadId:request;
let productTypes = getSessionStorageItem('productType');
const lmwHandler = (kyc_id) =>{
  let url, payload;
  if(isProduct('pet-insurance')){
    url =config.b2cApiBaseUrl+'v1/pet/update-lead';
    let petuserinfo = getLocalStorageItem('petuserinfo');
    payload = {url:url, payload:{kyc_id:kyc_id,leadId:get(petuserinfo,'leadId')}}
  }
  if(isProduct('health-insurance')){
    url =config.healthApiBaseUrl+'/health/leads/update-any-data';
    payload = {url:url, payload:{kyc_id:kyc_id,visit_id:leadId}}
  } 
  if(isProduct('bike-insurance') || isProduct('car-insurance') || (productTypes === 'motor-insurance') || (lmsProduct === 'motor-insurance')){
    url =config.lmwApiBaseUrl+'/api/v1/lead';
    payload = {url:url, payload:{kyc_id:kyc_id,lead_id:leadId}}
  } 
  if(isProduct('travel-insurance')){
    let traveluserinfo = getSessionStorageItem('traveluserinfo');
    let lead_id_travel = leadId = get(traveluserinfo,'leadId');
    url =config.b2cApiBaseUrl+'v1/travel/update-lead';
    payload = {url:url, payload:{kyc_id:kyc_id,leadId:lead_id_travel || leadId}}
  }

  // url =config.healthApiBaseUrl+'/health/leads/update-any-data';
  // payload = {url:url, payload:{kyc_id:"63a3f02b35d6500dc106307c",visit_id:"63a3edcd65c05376d41b4e60"}}
  return payload;
}
const KycMetaData = () =>{
  let kycMetaData = {};
  if(isProduct('pet-insurance')){
    let petSelectedQuotes = getSessionStorageItem('selectedQuotes');
    kycMetaData = get(petSelectedQuotes,'premiumData.1_year.kycMetaData',"");
  }
  if(isProduct('health-insurance')){
    let selectedQuotes = getSessionStorageItem('selectedQuotes');  
    kycMetaData = selectedQuotes.kycMetaData;
  } 
  if(isProduct('bike-insurance') || isProduct('car-insurance') || isProduct('car') || isProduct('bike') || isProduct('pcv')  || isProduct('gcv') || (productTypes === 'motor-insurance') || (lmsProduct === 'motor-insurance')){
    let selectedQuotes = getSessionStorageItem('quotes');  
    kycMetaData = selectedQuotes.kycMetaData;
    if(lmsProduct){
      let meta_data = getSessionStorageItem('metaData');
      kycMetaData =  get(meta_data,'kycMetaData',{});
    }
  } 
  if(isProduct('travel-insurance')){
    let travelSelectedQuotes = getSessionStorageItem('travelSelectedQuotes');
    kycMetaData = get(travelSelectedQuotes,'premiumData.1_year.kycMetaData',"");
  }
  return kycMetaData;
}

const metaKyc = () =>{
  let meta={};
  let selectedQuotes = getSessionStorageItem('selectedQuotes');  
  meta.subSource = appConfigs && appConfigs.subSource && appConfigs.subSource.toLowerCase();
  meta.source = appConfigs && appConfigs.appName;
  let callback_url = window.location.href;
  let callbackUrl = callback_url.split('#')
  meta.callbackUrl = callbackUrl[0];
  if(isProduct('pet-insurance')){
    let petuserinfo = getLocalStorageItem('petuserinfo');
    let proposerDetails = get(petuserinfo,'proposerDetails');
    let name = proposerDetails && `${proposerDetails.firstName} ${proposerDetails.lastName}`
    meta.insurerId = get(petuserinfo,'insurerId');
    meta.proposerName = name;
    meta.leadId = get(petuserinfo,'leadId'); 
    meta.productType =  "pet";
    meta.subProductType = "pet";
  }
  if(isProduct('health-insurance')){
    let healthInfo = getSessionStorageItem('healthinfo');
      meta.proposerName = healthInfo.name;
      meta.insurerId = selectedQuotes && selectedQuotes.insurer_id;
      meta.leadId = leadId;
      meta.productType = "health";
      meta.subProductType = "health";
  } 
  if(isProduct('bike-insurance') || isProduct('car-insurance') || isProduct('car') || isProduct('bike') || isProduct('pcv')  || isProduct('gcv') || (productTypes === 'motor-insurance') || (lmsProduct === 'motor-insurance')){
      let insuranceinfo = getSessionStorageItem('insuranceinfo');
      let selectedQuotes = getSessionStorageItem('quotes');

      // let proposerDetails = motoruserinfo && motoruserinfo.proposerDetails;
      // let name = proposerDetails && `${proposerDetails.firstName} ${proposerDetails.lastName}`
      // meta.subProductType = subProduct[selectedQuotes.policySubTypeId];
      
      meta.insurerId = selectedQuotes?.insurerId;
      let vehicleCategory = insuranceinfo?.vehicle_category ? insuranceinfo?.vehicle_category : insuranceinfo?.vehicleCategory;
      let isCommercialVehicle = insuranceinfo?.isCommercialVehicle;
      let subProductType = "";

      if(vehicleCategory=== 'car'){
        subProductType = isCommercialVehicle == '0' ? "FW" : "CFW";
      } else if(vehicleCategory=== 'bike'){
        subProductType = "TW";
      }

      meta.subProductType = subProductType;
      meta.proposerName = insuranceinfo?.customerName;
      meta.leadId = get(insuranceinfo,'lead_id') ||leadId;
      meta.productType = "motor";
      if(lmsProduct){
        meta.insurerId = parseInt(getQueryParams('insurerId'));
        meta.subProductType =getQueryParams('vehicleType');
        meta.subSource ="insurance-dekho";
        meta.source ="B2C";
        meta.callbackUrl = getSessionStorageItem("kycRedirectBackUrl");
        let meta_data = getSessionStorageItem('metaData');
        meta.proposerName =  get(meta_data,'proposerName','');
      }
  } 
  if(isProduct('travel-insurance')){
    let traveluserinfo = getSessionStorageItem('traveluserinfo');
    let travelSelectedQuotes = getSessionStorageItem('travelSelectedQuotes');

    let proposerDetails = get(traveluserinfo,'proposerDetails',{});
    let name = proposerDetails && `${proposerDetails.firstName} ${proposerDetails.lastName}`
    meta.insurerId = get(travelSelectedQuotes,'insurerId');
    meta.leadId = get(traveluserinfo,'leadId');
    meta.proposerName = name;
    meta.productType = "travel";
    meta.subProductType = "travel";
  }
  
  return meta;
}
const lmsHandler =() =>{
  console.log("inside handler ===========>");
  window.top.postMessage('kyc-completed', '*')
}
export function* postCkyc(data) {
  try {
    let meta = metaKyc();
    let kycMetaData = KycMetaData();
    meta.dob = data.payload.dob;
    let kycConfigDetails = getSessionStorageItem('kycConfig');  
    let customerTypeCkyc = get(kycConfigDetails,'insurer_document_config.ckyc[0].customer_type','');
    meta.customerType = (customerTypeCkyc === 'organization') ? "O" : "I";
    let json = yield postJsonData(
        config.kycApiBaseUrl+'/v1/kyc/ckyc',
    {
      meta,
      fields: data.payload.fields,
      is_id_module: get(kycConfigDetails,'status_config.is_id_module',0),
      is_proposal_allowed_without_kyc: get(kycConfigDetails,'status_config.is_proposal_allowed_without_kyc'),
      insurer_back_redirection: get(kycConfigDetails,'status_config.insurer_back_redirection'),
      kycMetaData
    },
    {"x-correlation-id": "",}
    );
    if(json.error){
      setSessionStorageItem('kyc_details',{});
      yield put({
        type: constants.UPDATE_KYC_STEP,
        payload: { step: 'error-page',error: json },
      });
    }else if (json.data) {
      setSessionStorageItem('kyc_details',json.data);
      if(json.data.error){
        if(json.data.kycCode === 'NAME_MISMATCH'){
          // yield put({
          //   type: constants.NAME_MISMATCH,
          //   payload: {},
          // });
          yield put({
            type: constants.UPDATE_KYC_STEP,
            payload: { step:'error-page'}
            });
        }else {
          yield put({
            type: constants.UPDATE_KYC_STEP,
            payload: { step:'error-page'}
            });
        }
      }
      let lmwData = lmwHandler(json.data.kycId);
      if(json.data.kycStatus === "success" || json.data.kycStatus === "pending"){
        lmwData.kycStatus = json.data.kycStatus;
        lmwData.kycCode = json.data.kycCode;
        if(json.data.kycCode === "INSURER_REDIRECTION" || json.data.kycCode == "DIGILOCKER_REDIRECTION"){
          lmwData.redirectUrl = json.data.redirectUrl;
        }
        yield put({
          type: constants.UPDATE_LMW,
          payload: lmwData,
        });
      }else{
        yield put({
          type: constants.UPDATE_KYC_STEP,
          payload: { step:'error-page'}
          });
      }
    }else{
      setSessionStorageItem('kyc_details',json.data); 
      yield put({
        type: constants.UPDATE_KYC_STEP,
        payload: { step:'error-page'}
        });
    }
} catch (error) {
    setSessionStorageItem('kyc_details',{});
    yield put({
    type: constants.CKYC_FAILED,
    payload: { step:'error-page', error: error.toString() },
    });
}
}

export function* postOkyc(data) {
    try {
    let meta = metaKyc();
    let kycMetaData = KycMetaData();
    meta.dob = data.payload.dob;
    let kycConfigDetails = getSessionStorageItem('kycConfig');
    let customerTypeCkyc = get(kycConfigDetails,'insurer_document_config.okyc[0].customer_type','');
    meta.customerType = (customerTypeCkyc === 'organization') ? "O" : "I";  
    let json = yield postJsonData(
        config.kycApiBaseUrl+'/v1/kyc/okyc',
      {
        meta: meta,
        fields: data.payload.fields,
        is_id_module: get(kycConfigDetails,'status_config.is_id_module',0),
        is_proposal_allowed_without_kyc: get(kycConfigDetails,'status_config.is_proposal_allowed_without_kyc'),
        insurer_back_redirection: get(kycConfigDetails,'status_config.insurer_back_redirection'),
        kycMetaData
      },
    {"x-correlation-id": "",}
    );

    if(json.error){
      setSessionStorageItem('kyc_details',{});
      yield put({
        type: constants.UPDATE_KYC_STEP,
        payload: { step: 'error-page',error: json },
      });
    } else if (json.data) {
      setSessionStorageItem('kyc_details',json.data);
      if(json.data.error){
        if(json.data.kycCode === 'NAME_MISMATCH'){
          yield put({
            type: constants.UPDATE_KYC_STEP,
            payload: { step:'error-page'}
            });
          // yield put({
          //   type: constants.NAME_MISMATCH,
          //   payload: {},
          // });
        }else {
          yield put({
            type: constants.UPDATE_KYC_STEP,
            payload: { step:'error-page'}
            });
        }
      }
      let lmwData = lmwHandler(json.data.kycId);
      if(json.data.kycStatus === "success" || json.data.kycStatus === "pending"){
        if(json.data.kycCode === "INSURER_REDIRECTION" || json.data.kycCode == 'DIGILOCKER_REDIRECTION'){
          lmwData.redirectUrl = json.data.redirectUrl;
        }
        lmwData.kycStatus = json.data.kycStatus;
        lmwData.kycCode = json.data.kycCode;
        yield put({
          type: constants.UPDATE_LMW,
          payload: lmwData,
        });
      } else{
        yield put({
          type: constants.UPDATE_KYC_STEP,
          payload: { step:'error-page'}
          });
      }
    }else{
      setSessionStorageItem('kyc_details',{});
      yield put({
        type: constants.UPDATE_KYC_STEP,
        payload: { step:'error-page'}
        });
    }
    } catch (error) {
        setSessionStorageItem('kyc_details',{});
        yield put({
            type: constants.OKYC_FAILED,
            payload: { step: "error-page", error: error.toString() },
        });
    }
}
export function* postOvd(data){
  try {
    let meta = metaKyc();
    let kycMetaData = KycMetaData();
    let kycConfigDetails = getSessionStorageItem('kycConfig'); 
    let customerTypeCkyc = get(kycConfigDetails,'insurer_document_config.ovd[0].customer_type','');
    meta.customerType = (customerTypeCkyc === 'organization') ? "O" : "I";   
    let json = yield postJsonData(
        config.kycApiBaseUrl+'/v2/kyc/ovd',
        {
          meta,
          fields: get(data,'payload.payload.fields',{}),
          is_id_module: get(kycConfigDetails,'status_config.is_id_module',0),
          is_proposal_allowed_without_kyc: get(kycConfigDetails,'status_config.is_proposal_allowed_without_kyc'),
          insurer_back_redirection: get(kycConfigDetails,'status_config.insurer_back_redirection'),
          kycMetaData
        },
        {"x-correlation-id": "",}
    );
    if(json.error){
      setSessionStorageItem('kyc_details',json);
      yield put({
        type: constants.UPDATE_KYC_STEP,
        payload: { step: 'error-page',error: json },
      });
    }else if (json.data) {
      setSessionStorageItem('kyc_details',json.data);
      if(json.data.error){
        if(json.data.kycCode === 'NAME_MISMATCH'){
          // yield put({
          //   type: constants.NAME_MISMATCH,
          //   payload: {},
          // });
          yield put({
            type: constants.UPDATE_KYC_STEP,
            payload: { step:'error-page'}
            });
        }else {
          yield put({
            type: constants.UPDATE_KYC_STEP,
            payload: { step:'error-page'}
            });
        }
      }

      let lmwData = lmwHandler(json.data.kycId);
      if(json.data.kycStatus === "success" || json.data.kycStatus === "pending"){
        if(json.data.kycCode === "INSURER_REDIRECTION" || json.data.kycCode === "DIGILOCKER_REDIRECTION"){
          lmwData.redirectUrl = json.data.redirectUrl;
        }
        lmwData.kycStatus = json.data.kycStatus;
        lmwData.kycCode = json.data.kycCode;
        yield put({
          type: constants.UPDATE_LMW,
          payload: lmwData,
        });
      } else{
        yield put({
          type: constants.UPDATE_KYC_STEP,
          payload: { step:'error-page'}
          });
      }
    }else{
      setSessionStorageItem('kyc_details',{});
      yield put({
        type: constants.UPDATE_KYC_STEP,
        payload: { step:'main'}
        });
    }
} catch (error) {
    setSessionStorageItem('kyc_details',{});
    yield put({
    type: constants.OVD_FAILED,
    payload: { step:'error-page', error: error.toString() },
    });
}
}
export function* updateLmw(data){
  try {
    let payload = data.payload.payload;
    let json = yield postJsonData(
        data.payload.url,
        payload,
        {"x-correlation-id": "","x-api-key":""}
    );
      if(data.payload.kycStatus === "success"){
      lmsHandler();
      yield put({
        type: constants.UPDATE_KYC_STEP,
        payload: { step:'success'}
        });
    } else if(data.payload.kycStatus === "pending"){
      if(data.payload.kycCode === "INSURER_REDIRECTION" || data.payload.kycCode === "DIGILOCKER_REDIRECTION"){
        let kycConfigDetails = getSessionStorageItem('kycConfig'); 
        if(lmsProduct){
          if(kycConfigDetails?.is_redirection_enabled){
            const eventPayloadSameTab = {eventType : "redirect_same_tab", kycEventPayload : {url:data.payload.redirectUrl}}
            window.top.postMessage(eventPayloadSameTab, '*')
          } else{
            const eventPayloadNewTab = {eventType : "redirect_new_tab", kycEventPayload : {url:data.payload.redirectUrl}}
            window.top.postMessage(eventPayloadNewTab, '*')
          }
        }else{
          console.log("inside it is_redirection_enabled",kycConfigDetails?.is_redirection_enabled,data.payload.redirectUrl);
          if(kycConfigDetails?.is_redirection_enabled){
            if(typeof Android !== undefined && typeof Android !== 'undefined'){
              window["Android"].loadNewPageInApp(data.payload.redirectUrl);
            } else{
              window.location = data.payload.redirectUrl;
            }
          }else{
            if(typeof Android !== undefined && typeof Android !== 'undefined'){
              window["Android"].loadNewPageInApp(data.payload.redirectUrl);
            } else{
              window.open(data.payload.redirectUrl,"_blank");
            }
          }
        }
      } else{
        yield put({
          type: constants.UPDATE_KYC_STEP,
          payload: {step:'pending'}
        });
      }

    } else{
      yield put({
        type: constants.UPDATE_KYC_STEP,
        payload: { step:'error-page' },
        });
    }
} catch (error) {
  yield put({
    type: constants.UPDATE_KYC_STEP,
    payload: { step:'error-page', error: error },
    });
}
}