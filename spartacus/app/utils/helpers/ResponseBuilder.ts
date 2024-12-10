/**
 * Author - Ankit Shukla
 */

import storageHelper from '@helpers/StorageHelper';
import Constants from '@constants/Constants';
import response from '@constants/ResponseConstants';

export default class ResponseHelper {
    
    public static build = (type: keyof typeof response, result: any, display_message: any) => {
        return {
            status              : response[type].status,
            message             : response[type].message,
            display_message     : display_message ? display_message : response[type].display_message,
            result              : result,
            "x-correlation-id"  : storageHelper.storage.getStore().get(Constants.CORRELATOR.X_CORRELATION_ID),
        };
    };

    public static error = (type: keyof typeof response, error: any, display_message: any) => {
        return {
            status              : response[type].status,
            message             : response[type].message,
            display_message     : display_message ? display_message : response[type].display_message,
            error               : error,
            "x-correlation-id"  : storageHelper.storage.getStore().get(Constants.CORRELATOR.X_CORRELATION_ID),
        };
    };
}