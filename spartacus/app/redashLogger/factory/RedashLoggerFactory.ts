import DistanceTimeBasedOnPincodeRedashLogger from "../classes/DistanceTimeBasedOnPincodeRedashLogger";
import GeoReverseCodingRedashLogger from "../classes/GeoReverseCodingRedashLogger";
import PlaceDetailsRedashLogger from "../classes/PlaceDetailsRedashLogger";
import SuggestionsRedashLogger from "../classes/SuggestionsRedashLogger";
import IPInfoRedashLogger from "../classes/IPInfoRedashLogger";
import { RedashRequestTypes } from "@app/enums/RedashRequstTypes";

class RedashFactory {
    getRedashLoggerByType(type: RedashRequestTypes) {
        switch(type) {
            case RedashRequestTypes.DISTANCE_TIME_BASED_ON_PINCODE: 
                return DistanceTimeBasedOnPincodeRedashLogger;
            case RedashRequestTypes.GEO_REVERSE_CODING:
                return GeoReverseCodingRedashLogger;
            case RedashRequestTypes.PLACE_DETAILS:
                return PlaceDetailsRedashLogger; 
            case RedashRequestTypes.SUGGESTIONS: 
                return SuggestionsRedashLogger;
            case RedashRequestTypes.IP_INFO: 
                return IPInfoRedashLogger;
        }
    }
}

export default new RedashFactory();