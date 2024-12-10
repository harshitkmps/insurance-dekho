/**
 * Author   -   Ankit Shukla
 */

import _ from 'lodash';
import moment from "moment"
import Constants from "@constants/Constants"

export default class CommonHelper {
    public static getDateTime = (timeZone: string = Constants.MOMENT.UTC.IST, dateTimeFormat: string = Constants.MOMENT.DATE_TIME_FORMATS.DEFAULT) => {
        return moment().utc().utcOffset(timeZone).format(dateTimeFormat);
    };

    public static capitalizeFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public static filterKeysFromArrayOfObjects = (arrayOfObjects: Array<object>, keysToKeep: Array<string>, onlyKeepValues: Boolean = false) => {
        const filteredData:Array<object> = [];
        _.forEach(arrayOfObjects, (Obj) => {
            let filteredObj = _.pick(Obj, keysToKeep);
            if(onlyKeepValues) filteredObj = _.values(filteredObj);
            filteredData.push(filteredObj);
        });
        return filteredData;
    };

    public static prepareStackTrace = (type:any, blamer:any, data: any = '') => {
        return `${type}  -  (${blamer.stack[0].short}-${blamer.stack[0].call}-${blamer.stack[0].line}) : ${data}`;
    };

    public static prepareObjectFromMap = (rawObject: Object, map: any) => {
        const newObject = {};
        _.forEach(map, (value: any, key: any) => {
            if(_.hasIn(rawObject, value)) {
                _.set(newObject, key, _.get(rawObject, value));
            }
        });
        return newObject;
    }
}