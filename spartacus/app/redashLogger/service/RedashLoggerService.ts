import { RedashRequestTypes } from "@app/enums/RedashRequstTypes";
import RedashFactory from "../factory/RedashLoggerFactory";
import { redash } from "@app/interfaces/redash";
import RedashModel from "@app/models/RedashModel";

const requestTypeMapping: Record<string, RedashRequestTypes> = {
    'https://maps.googleapis.com/maps/api/distancematrix/json': RedashRequestTypes.DISTANCE_TIME_BASED_ON_PINCODE,
    'https://maps.googleapis.com/maps/api/place/details/json': RedashRequestTypes.PLACE_DETAILS, 
    'https://maps.googleapis.com/maps/api/place/autocomplete/json': RedashRequestTypes.SUGGESTIONS, 
    'https://maps.googleapis.com/maps/api/geocode/json': RedashRequestTypes.GEO_REVERSE_CODING,
    'https://ipinfo.io/': RedashRequestTypes.IP_INFO
}

class RedashLoggerService {

        getRedashData(req: any, res: any, err: any) : redash | null {
        const url = req.url;
        let requestType: RedashRequestTypes = requestTypeMapping[url];
        if(url.includes('ipinfo.io'))
            requestType = RedashRequestTypes.IP_INFO;

        const requestLoggerObject: any = RedashFactory.getRedashLoggerByType(requestType);
        if(!requestLoggerObject)
            return null;

        const cost: Number = requestLoggerObject.getCost(req, res, err);
        const statusCode: Number = requestLoggerObject.getStatusCode(req, res, err);
        const redashObjecToInsert: redash = {
            requestType: requestType,
            cost: cost,
            statusCode: statusCode, 
            
        }

        return redashObjecToInsert;
    }

    insertRedashLog(req: any, res: any, err: any) {
        const redashDataToInsert: redash | null = this.getRedashData(req, res, err);
        if(redashDataToInsert != null) 
            RedashModel.create(redashDataToInsert);
    }
}

export default new RedashLoggerService();