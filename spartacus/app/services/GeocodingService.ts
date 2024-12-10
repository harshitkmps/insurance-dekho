/**
 * Author - Ankit Shukla
 * Module - Used for accessing google geocdoing services
 */

const blame = require("blame");
import storageHelper from "@app/utils/helpers/StorageHelper";
import logger from "@config/services/WinstonConfig";
import apiHelper from "@helpers/ApiHelper";
import requestBuilder from '@helpers/RequestBuilder';
import { RequestTypes } from "@app/enums/RequestType";
import CommonHelper from "@app/utils/helpers/CommonHelper";
import Constants from "@app/utils/constants/Constants";

export default class GeocodingService {

    // service to fetch address from latitude and longitude
    public static async getAddressFromLatLong (data: any) {
        try {
            const responseData = await this.getAddressFromLatLongMethods.getAddressGeoReverseCoding(data);
            return { data :responseData};
        } catch (err) {
            logger.error(`Error in getAddressFromLatLong : ${err}`);
            throw err;
        }
    };

    private static readonly getAddressFromLatLongMethods = {
        getAddressGeoReverseCoding: async (payload: any) => {
            try {
                const request = requestBuilder.build(RequestTypes.GEO_REVERSE_CODING,payload);
                const result = await apiHelper.httpRequest(request);
                storageHelper.setStackTraceData(CommonHelper.prepareStackTrace(Constants.STACK_TRACE.TYPE.LOG, blame.stack(), "fetched address based on lat long"));
                return result;
            } catch (err) {
                storageHelper.setStackTraceData(CommonHelper.prepareStackTrace(Constants.STACK_TRACE.TYPE.FAILURE, blame.stack(), "unable to fetch address based on lat long"));
                throw err;
            }
        }
    };
};