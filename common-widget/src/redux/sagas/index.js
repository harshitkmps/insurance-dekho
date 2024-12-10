import { all, takeEvery, takeLatest } from "redux-saga/effects";
import * as constants from "../constants/index";
import {
  initiateSendOtp,
  resendLoginOtp,
  sendLoginOtp,
  generateGoogleRecaptchaToken,
  verifyLoginOtp,
} from "./OTPLoginSaga";
import { validateGoogleLogin } from "./GoogleLoginSaga";
import { logout } from "./LogoutSaga";
import {
  getCompletionStatus,
  getContent,
  getEntireContent,
  updateCompletionStatus,
  addCourses,
  deleteCourse,
  editCourse,
} from "./LearningSaga";
import {
  getBanner,
  getCustomBanner,
  addBanner,
  deleteBanner,
  editBanner,
} from "./PromotionalBannerSaga";

import {
  initReactFormBuilder,
  validateFieldValue,
  validateAndSubmitFromStep,
} from "./ReactFormBuilderSaga";

import { postOkyc, postCkyc, postOvd, updateLmw } from "./KycSaga";
import {
  addIdExclusiveBanner,
  deleteIdExclusiveBanner,
  editIdExclusiveBanner,
  getIdExclusiveBanner,
  getTenantsList,
} from "./IdExclusiveBannerSaga";

function* actionWatcher() {
  yield takeEvery(constants.VALIDATE_GOOGLE_LOGIN, validateGoogleLogin);
  yield takeEvery(constants.INITIATE_SEND_OTP, initiateSendOtp);
  yield takeEvery(constants.SEND_LOGIN_OTP, sendLoginOtp);
  yield takeEvery(
    constants.GENERATE_GOOGLE_RECAPTCHA_TOKEN,
    generateGoogleRecaptchaToken
  );
  yield takeEvery(constants.VERIFY_LOGIN_OTP, verifyLoginOtp);
  yield takeEvery(constants.RESEND_LOGIN_OTP, resendLoginOtp);
  yield takeEvery(constants.INITIATE_LOGOUT, logout);

  //Learning
  yield takeEvery(constants.GET_CONTENT, getContent);
  yield takeEvery(constants.GET_ENTIRE_CONTENT, getEntireContent);
  yield takeEvery(constants.GET_COMPLETION_STATUS, getCompletionStatus);
  yield takeEvery(constants.UPDATE_COMPLETION_STATUS, updateCompletionStatus);
  yield takeEvery(constants.ADD_COURSE, addCourses);
  yield takeEvery(constants.DELETE_COURSE, deleteCourse);
  yield takeEvery(constants.EDIT_COURSE, editCourse);

  //Promotional Banner
  yield takeEvery(constants.GET_BANNER, getBanner);
  yield takeEvery(constants.GET_CUSTOM_BANNER, getCustomBanner);
  yield takeEvery(constants.ADD_BANNER, addBanner);
  yield takeEvery(constants.DELETE_BANNER, deleteBanner);
  yield takeEvery(constants.EDIT_BANNER, editBanner);

  yield takeEvery(constants.INIT_RFB, initReactFormBuilder);
  yield takeEvery(
    constants.VALIDATE_SUBMIT_FORM_STEP,
    validateAndSubmitFromStep
  );

  yield takeEvery(constants.VALIDATE_FIELD_VALUE, validateFieldValue);

  yield takeEvery(constants.CKYC_INPROGRESS, postCkyc);
  yield takeEvery(constants.OKYC_INPROGRESS, postOkyc);
  yield takeEvery(constants.OVD_START, postOvd);
  yield takeEvery(constants.UPDATE_LMW, updateLmw);
}

function* actionIdExclusiveBannerWatcher() {
  yield takeLatest(constants.ADD_ID_EXCLUSIVE_BANNER, addIdExclusiveBanner);
  yield takeEvery(constants.GET_ID_EXCLUSIVE_BANNER, getIdExclusiveBanner);
  yield takeLatest(constants.EDIT_ID_EXCLUSIVE_BANNER, editIdExclusiveBanner);
  yield takeLatest(
    constants.DELETE_ID_EXCLUSIVE_BANNER,
    deleteIdExclusiveBanner
  );
  yield takeLatest(constants.GET_TENANTS_LIST, getTenantsList);
}

export default function* rootSaga() {
  yield all([actionWatcher(), actionIdExclusiveBannerWatcher()]);
}
