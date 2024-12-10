/**
 * Author - Ankit Shukla
 */

export default class ThirdPartyConfig {
 
    public static readonly GOOGLE_MAP_SERVICE = {
        HEADERS: {},
        END_POINTS: {
            GEO_REVERSE_CODING : "maps/api/geocode/json",
            PINCODE_DISTANCE_AND_TIME : "maps/api/distancematrix/json",
            AUTOCOMPLETE_SUGGESTIONS : "maps/api/place/autocomplete/json",
            PLACE_DETAILS : "maps/api/place/details/json"
        }
    }
    public static readonly IP_INFO_SERVICE = {
        HEADERS: {},
        END_POINTS: {
                 IP_INFO : ''
        }
    }
   
    
}