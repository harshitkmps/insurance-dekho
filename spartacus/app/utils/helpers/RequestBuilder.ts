/**
 * Author   -   Ankit Shukla
 */

import _ from 'lodash';
import Constants from '@constants/Constants';
import CommonHelper from "@helpers/CommonHelper";
import thirdPartyConfig from '@config/services/ThirdPartyConfig';
import { RequestTypes } from '@app/enums/RequestType';

export default class RequestBuilder {


    private static readonly prepareGeoReverseCodingRequest = (payload: any) => {
        const googleApiKey = `${process.env.GOOGLE_API_KEY}`
        payload = {...payload, "key" : googleApiKey}
        return  {
            headers     : thirdPartyConfig.GOOGLE_MAP_SERVICE.HEADERS,
            query       : payload,
            method      : Constants.REQUEST.METHOD.GET,
            url         : `${process.env.GOOGLE_MAPS_BASE_URL}/${thirdPartyConfig.GOOGLE_MAP_SERVICE.END_POINTS.GEO_REVERSE_CODING}`,
        }
    };

    private static readonly prepareDistanceAndTimeBasedOnPincodeRequest = (req: any) => {
        const googleApiKey = `${process.env.GOOGLE_API_KEY}`
        let payload = {
                "key" : googleApiKey,
                "origins" : req.data.origins,
                "destinations" : req.data.destinations
            }
    
        let option =   {
            headers     : thirdPartyConfig.GOOGLE_MAP_SERVICE.HEADERS,
            method      : Constants.REQUEST.METHOD.GET,
            query       : payload,
            url         : `${process.env.GOOGLE_MAPS_BASE_URL}/${thirdPartyConfig.GOOGLE_MAP_SERVICE.END_POINTS.PINCODE_DISTANCE_AND_TIME}`,
        }

        console.log("option", option);
        return option
    };

    private static readonly prepareAutoComplteSuggestionsRequest = (payload:any) => {
        const googleApiKey = `${process.env.GOOGLE_API_KEY}`
        payload = {...payload, "key" : googleApiKey}
        return  {
            headers     : thirdPartyConfig.GOOGLE_MAP_SERVICE.HEADERS,
            query       : payload,
            method      : Constants.REQUEST.METHOD.GET,
            url         : `${process.env.GOOGLE_MAPS_BASE_URL}/${thirdPartyConfig.GOOGLE_MAP_SERVICE.END_POINTS.AUTOCOMPLETE_SUGGESTIONS}`,
        }

      
    }
    private static readonly preparePlaceDetailsRequest = (payload:any) => {
        const googleApiKey = `${process.env.GOOGLE_API_KEY}`
        payload = {...payload, "key" : googleApiKey}
        return  {
            headers     : thirdPartyConfig.GOOGLE_MAP_SERVICE.HEADERS,
            query       : payload,
            method      : Constants.REQUEST.METHOD.GET,
            url         : `${process.env.GOOGLE_MAPS_BASE_URL}/${thirdPartyConfig.GOOGLE_MAP_SERVICE.END_POINTS.PLACE_DETAILS}`,
        }

      
    }
    private static readonly prepareIPinfoRequest = (payload:any) => {
        const ipInfoApiToken = `${process.env.IP_INFO_TOKEN}`
        payload = {...payload, token : ipInfoApiToken }
        return  {
            headers     : thirdPartyConfig.IP_INFO_SERVICE.HEADERS,
            query       : payload,
            method      : Constants.REQUEST.METHOD.GET,
            url         : `${process.env.IP_INFO_BASE_URL}${thirdPartyConfig.IP_INFO_SERVICE.END_POINTS.IP_INFO}`,
        }

      
    }
    
    public static build = (type: number, payload: any) => {
        switch (type) {
            
            
            case RequestTypes.GEO_REVERSE_CODING:
                payload = this.prepareGeoReverseCodingRequest(payload);
                break;
            case RequestTypes.DISTANCE_TIME_BASED_ON_PINCODE: 
                payload = this.prepareDistanceAndTimeBasedOnPincodeRequest(payload);
                break;
            case RequestTypes.SUGGESTIONS:
                payload = this.prepareAutoComplteSuggestionsRequest(payload);
                break;
            case RequestTypes.PLACE_DETAILS:
                payload = this.preparePlaceDetailsRequest(payload);
                break;   
            case RequestTypes.IP_INFO:
                payload = this.prepareIPinfoRequest(payload);
                break;
            default:
                break;
        }
        return payload;
    } 

}
