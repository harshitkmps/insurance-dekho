
const _ = require("lodash");
const ErrorLog = require('../../../common/models/ErrorLogModel');
const {sendGetRequestToBrokerage, sendPostRequest}  = require('../../../../helpers/CommonHelper')
exports.addCityNameAndMemberDetails = async function (records) {
    try {
        let map = new Map();
        const result = await Promise.all(records.map(async (r) => {
            if(r.city_id && !map.has(r.city_id)){
                let endPoint = `/api/v1/master/city/${r.city_id}`
                    const data  = await sendGetRequestToBrokerage(r.city_id, endPoint);
                    if(data && data.length>0 && data[0].cityName)
                       map.set(r.city_id, data[0].cityName);   
            }
                var lmwConfig = {
                    host: config.lmw.host,
                    path: "/health/leads/lead-details",
                    protocol: config.lmw.protocol,
                };
                let options = {
                    "visit_id": r.visit_id,
                    "group_id": 1,
                }
                const leadData = await sendPostRequest(options, lmwConfig);
                if(leadData && leadData.result && leadData.result.groups && leadData.result.groups["1"] && leadData.result.groups["1"].member_details){
                    const member_details = leadData.result.groups["1"].member_details;
                    const keys = Object.keys(member_details);
                    r['self_relation'] = keys[0];
                    if(keys.length>1){
                        r['spouse_relation'] = keys[1];
                    }
                }
              if(map.has(r.city_id)){
                r['city_name'] = map.get(r.city_id);
             }else{
                //default city name
                r['city_name'] = 'delhi'
             }

             return r;
        }));
        return result;
    } catch (ex) {
        ErrorLog.addErrorLog('Error in addCityNameAndMemberDetails : ', ex);
        console.log("Error in addCityNameAndMemberDetails", ex);
        throw ex;
    }
}
