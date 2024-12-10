import * as constants from "../constants";

export const StartCkyc = (payload) => {
    return { type: constants.CKYC_START, payload: payload };
};
export const StartOkyc = (payload) => {
    return { type: constants.OKYC_START, payload: payload };
};
export const InprogressCkyc = (payload) => {
    return { type: constants.CKYC_INPROGRESS, payload: payload };
};
export const InprogressOkyc = (payload) => {
    return { type: constants.OKYC_INPROGRESS, payload: payload };
};
export const BackStep = (payload) => {
    return { type: constants.BACK_STEP, payload: payload };
};
export const UploadImage = (payload) => {
    return { type: constants.UPLOAD_IMAGE, payload: payload };
};
export const StartOvd = (payload) => {
    return { type: constants.OVD_START, payload: payload };
};
export const UpdateLmw = (payload) => {
    return { type: constants.UPDATE_LMW, payload: payload };
};
export const OkycLmw = (payload) => {
    return { type: constants.OKYC_LMW, payload: payload };
};
export const mainPage = (payload) => {
    return { type: constants.MAIN, payload: payload };
};
export const fetchOkycDetails = (payload) => {
    return { type: constants.GET_OKYC, payload: payload };
};
export const InprogressUpdateImage = (payload) => {
    return { type: constants.UPDATE_IMAGE_INPROGRESS, payload: payload };
};
export const updateStep = (payload) => {
    return { type: constants.UPDATE_KYC_STEP, payload: payload };
};
export const edgeCaseOvd = (payload) => {
    return { type: constants.EDGE_CASES_OVD, payload: payload };
};