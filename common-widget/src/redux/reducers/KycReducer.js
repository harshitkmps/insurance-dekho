import * as constants from "../constants";
let defaultState = {
    step:'main',
    identifierType:null,
    loader:{},
    okycData:null,
    nameMismatch:false,
};

const KycReducer = (state = defaultState, action) => {
switch (action.type) {
case constants.CKYC_START:
    return {
        ...state,
        ...action.payload
    };
case constants.CKYC_INPROGRESS:
    return {
        ...state,
        loader: {...state.loader, ckyc_next:true}
    };
case constants.CKYC_SUCCESS:
    return {
        ...state,
        ...action.payload,
        loader: {...state.loader, ckyc_next:false}
    };
case constants.CKYC_FAILED:
    return {
        ...state,
        ...action.payload,
        loader: {}
    };
case constants.OVD_FAILED:
    return {
        ...state,
        ...action.payload,
        loader: {}
    };
case constants.OKYC_INPROGRESS:
    return {
        ...state,
        loader: {...state.loader, okyc_next:true}
    };
case constants.OKYC_START:
    return {
        ...state,
        ...action.payload
    };
case constants.OKYC_FAILED:
    return {
        ...state,
        ...action.payload,
        loader: {...state.loader, ckyc_next:false}
    };
case constants.BACK_STEP:
    return {
        ...state,
        step:action.payload.step,
        loader:{}
    };
case constants.UPLOAD_IMAGE:
    return {
        ...state,
        ...action.payload
    };
case constants.OVD_START:
    return {
        ...state,
        loader: {...state.loader, verify_doc_next:true}
    };
case constants.OVD_SUCCESS:
    return {
        ...state,
        ...action.payload,
        loader: {...state.loader, verify_doc_next:false},
        step:'main'

    };
case constants.MAIN:
    return {
        ...state,
        step:'main'

    };
case constants.SET_OKYC_DATA:
    return {
        ...state,
        okycData:action.payload
    };
case constants.UPDATE_IMAGE_INPROGRESS:
    return {
        ...state,
        loader: {...state.loader, upload_image_next:true}
    };
case constants.UPDATE_KYC_STEP:
    return {
        ...state,
        step:action.payload.step,
        loader:{}
    };
case constants.EDGE_CASES_OVD:
    return {
        ...state,
        ovdFeild: action.payload.nextStepFields,
        ovdOptions: action.payload.nextStepOptions,
        is_id_module:action.payload.is_id_module,
        step:'edge-case-ovd'
    };
case constants.NAME_MISMATCH:
    return {
        ...state,
        nameMismatch:true
    }
    default:
    return state;
}
};
export default KycReducer;
 