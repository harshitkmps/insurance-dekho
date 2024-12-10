
const blame = require("blame");
import storageHelper from "@app/utils/helpers/StorageHelper";
import apiHelper from "@helpers/ApiHelper";
import requestBuilder from '@helpers/RequestBuilder';
import { RequestTypes } from "@app/enums/RequestType";
import CommonHelper from "@app/utils/helpers/CommonHelper";
import Constants from "@app/utils/constants/Constants";


export default class SuggestionsService {

    public static async fetchSuggestions(data: any) {

        const responseData = await this.getSuggestions.getAutocompleteSuggestion(data);
        return { data: responseData };

    };

    private static readonly getSuggestions = {
        getAutocompleteSuggestion: async (payload: any) => {
            try {
                const request = requestBuilder.build(RequestTypes.SUGGESTIONS, payload);
                const result = await apiHelper.httpRequest(request);
                storageHelper.setStackTraceData(CommonHelper.prepareStackTrace(Constants.STACK_TRACE.TYPE.LOG, blame.stack(), "fetched sugggestions based on input and country"));
                return result;
            } catch (err) {
                storageHelper.setStackTraceData(CommonHelper.prepareStackTrace(Constants.STACK_TRACE.TYPE.FAILURE, blame.stack(), "unable to fetch sugggestions based on input and country"));
                throw err;
            }
        }
    };
};


