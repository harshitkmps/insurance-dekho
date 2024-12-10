/**
 * Redux Saga : "LoginListing"
 * Purpose : Generator functions that deals with ajax calls and performs followup action
 */

import { put } from "redux-saga/effects";
import * as constants from "../constants";
import { postJsonData } from "../../utils/api";

export function* logout(data) {
  try {
    let json = yield postJsonData(
      "/iam/api/v1/user/auth/logout",
      {},
      {
        "x-correlation-id": "",
      }
    );

    if (json.data) {
      json = json.data;
    }

    if (json && json.statusCode == 200 && json.status == "T") {
      yield put({
        type: constants.LOGOUT_SUCCESS,
        payload: { ...data.payload },
      });
      yield put({
        type: constants.LOGOUT_RESET,
      });
    } else {
      let errorMsg = json.errorResp.errors[0].error.err.message;
      yield put({
        type: constants.LOGOUT_FAILED,
        payload: { ...data.payload, error: errorMsg },
      });
    }
  } catch (error) {
    console.log("error", error);
    yield put({
      type: constants.LOGOUT_FAILED,
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
