/**
 * Redux Saga : "LoginListing"
 * Purpose : Generator functions that deals with ajax calls and performs followup action
 */

import { put } from "redux-saga/effects";
import * as constants from "../constants";
import { postJsonData } from "../../utils/api";
import configs from "../../app-configs";
import loadGoogleRecaptcha from "../../utils/googleRecaptcha";

export function* initiateSendOtp(data) {
  try {
    yield put({
      type: constants.GENERATE_GOOGLE_RECAPTCHA_TOKEN,
      payload: data.payload,
    });
  } catch (error) {
    console.log("error", error);
  }
}

export function* resendLoginOtp(data) {
  try {
    yield put({
      type: constants.GENERATE_GOOGLE_RECAPTCHA_TOKEN,
      payload: { ...data.payload, resend: true },
    });
  } catch (error) {
    console.log("error", error);
  }
}

export function* generateGoogleRecaptchaToken(data) {
  try {
    const token = yield loadGoogleRecaptcha((resolve) => {
      window["grecaptcha"].ready(() => {
        window["grecaptcha"]
          .execute(configs.googleRecaptchaSiteKey, { action: "submit" })
          .then((token) => {
            resolve(token);
          });
      });
    });
    yield put({
      type: constants.SEND_LOGIN_OTP,
      payload: { token, ...data.payload },
    });
  } catch (error) {
    console.log("error", error);
  }
}

export function* sendLoginOtp(data) {
  try {
    let api =
      data.payload.signup === true
        ? "/iam/api/v1/user/auth/otp"
        : "/iam/api/v2/user/auth/otp";

    let headers = {
      "x-token-id": data.payload.token,
      "x-correlation-id": "",
    };

    if(data.payload.headerKeys){
      headers = {...headers, ...data.payload.headerKeys}
    }

    let json = yield postJsonData(
      api,
      {
        mobile: data.payload.mobileNumber,
        sub_source: data.payload.sub_source,
        source: data.payload.source,
      },
      headers
    );

    if (json.data) {
      json = json.data;
    }

    if (json && json.statusCode === 200 && json.status === "T") {
      yield put({
        type: constants.OTP_SEND_SUCCESS,
        payload: { ...data.payload, authCode: json.authCode },
      });
    } else {
      if (json.errorCode && json.errorCode == 'IAM403TONU') {
        yield put({
          type: constants.OTP_SEND_FAILED,
          payload: { ...data.payload, error: json.message },
        });
      } else {
        yield put({
          type: constants.OTP_SEND_FAILED,
          payload: { ...data.payload, error: json.message },
        }); 
      }
    }
  } catch (error) {
    console.log("error", error);
    yield put({
      type: constants.OTP_SEND_FAILED,
      payload: { ...data.payload, error },
    });
  }
}

export function* verifyLoginOtp(data) {
  try {
    let api = data.payload.signup === true ? "/iam/api/v1/user/auth/otp-verification" : "/iam/api/v2/user/auth/otp-verification";

    let headers = {
      "x-correlation-id": "",
    }

    if(data.payload.headerKeys){
      headers = {...headers, ...data.payload.headerKeys}
    }

    let json = yield postJsonData(
      api,
      data.payload,
      headers
    );
    if (json.data && json.data.data) {
      json = json.data;
    }

    if (json && json.statusCode == 200 && json.status == "T") {
      yield put({
        type: constants.OTP_VERIFY_SUCCESS,
        payload: { ...data.payload },
      });
      yield put({
        type: constants.OTP_LOGIN_SUCCESS,
        payload: { ...data.payload, res: json },
      });
      yield put({
        type: constants.OTP_LOGIN_RESET,
      });
    } else {
      console.log(125, json);
      let errorMsg = json.errorResp.errors[0].error.message;
      yield put({
        type: constants.OTP_LOGIN_FAILED,
        payload: { ...data.payload, error: errorMsg },
      });
    }
  } catch (error) {
    console.log("verifyLoginOtp error => ", error);
    yield put({
      type: constants.OTP_VERIFY_FAILED,
      payload: { ...data.payload, error: error.toString() },
    });
  }
}

/*
    logout: {
        url: 'iam/api/v2/user/auth/logout',
        options: {},
        urlPrefix: 'apiIAMBaseUrl'
    },
*/
