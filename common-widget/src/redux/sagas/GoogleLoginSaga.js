/**
 * Redux Saga : "LoginListing"
 * Purpose : Generator functions that deals with ajax calls and performs followup action
 */

import { put } from "redux-saga/effects";
import * as constants from "../constants";
import { postJsonData } from "../../utils/api";
import decodeJWT from "../../utils/decodeJWT";
import configs from "../../app-configs";

export function* validateGoogleLogin(data) {
  try {
    const json = yield postJsonData(
      "/iam/api/v1/user/auth/login",
      {
        token: data.payload.credential,
        mode: "gmail",
      },
      {
        "x-correlation-id": "",
      }
    );

    if (json.data && json.data.data) {
      json = json.data;
    }

    if (json && json.statusCode == 200 && json.status == "T") {
      yield put({
        type: constants.GOOGLE_VERIFY_SUCCESS,
        payload: { ...data.payload },
      });
      yield put({
        type: constants.GOOGLE_LOGIN_SUCCESS,
        payload: decodeJWT(data.payload.credential),
      });
      yield put({
        type: constants.GOOGLE_LOGIN_RESET,
      });
    } else {
      let errorMsg = json.errorResp.errors[0].error.err.message;
      yield put({
        type: constants.GOOGLE_LOGIN_FAILED,
        payload: { ...data.payload, error: errorMsg },
      });
    }
  } catch (error) {
    console.log("error", error);
    yield put({
      type: constants.GOOGLE_VERIFY_FAILED,
      payload: { ...data.payload, error: error.toString() },
    });
  }
}

/*
    logout: {
        url: 'iam/api/v1/user/auth/logout',
        options: {},
        urlPrefix: 'apiIAMBaseUrl'
    },
*/
