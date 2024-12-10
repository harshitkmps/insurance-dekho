const blame = require("blame");
import storageHelper from "@app/utils/helpers/StorageHelper";
import apiHelper from "@helpers/ApiHelper";
import requestBuilder from '@helpers/RequestBuilder';
import { RequestTypes } from "@app/enums/RequestType";
import CommonHelper from "@app/utils/helpers/CommonHelper";
import Constants from "@app/utils/constants/Constants";


export default class PlaceDetailsService {

    public static async fetchPlaceDetails(data: any) {

        const responseData = await this.getPlaceDetails.getPlace_Details(data);
        return { data: responseData };

    };

    private static readonly getPlaceDetails = {
        getPlace_Details: async (payload: any) => {
            try {
                const request = requestBuilder.build(RequestTypes.PLACE_DETAILS, payload);
                const result = await apiHelper.httpRequest(request);
                storageHelper.setStackTraceData(CommonHelper.prepareStackTrace(Constants.STACK_TRACE.TYPE.LOG, blame.stack(), "fetched place details based on placeid"));
                return result;
            } catch (err) {
                storageHelper.setStackTraceData(CommonHelper.prepareStackTrace(Constants.STACK_TRACE.TYPE.FAILURE, blame.stack(), "unable to fetch place details based on placeid"));
                throw err;
            }
        }
    };
};


