const { PRODUCTS, ACTIVITY } = require("../../../../config/constants");
const { sendPostRequest } = require("../../../../helpers/CommonHelper")
const ErrorLog = require('../../../common/models/ErrorLogModel');

exports.updateActivity = async function (records, campaignData) {   
    try {
        const promises = records.map(r => {
            const request = {
                product : PRODUCTS[r.product_id],
                lead_id : r.lead_id,
                activity_name : ACTIVITY[campaignData.communication_type],
                activity_header : ACTIVITY[campaignData.communication_type],
                activity_category : "communication",
                created_by : "system",
                created_by_id   : 1,
                created_by_name : "Campaign",
                created_by_role : "System",
                comment : "Communication sent",
                section : "Campaign",
                user    : "Campaign"
            }
            const ulmsConfig = {
                host : config.ulms_api.host,
                path : "/conversation/v1/activity-create",
                protocol : config.ulms_api.protocol,
                headers : {
                    'Content-Type': 'application/json',
                    "x-auth-id" : config.ulms_api.authId 
                }
            }
            if(((campaignData.communication_type === ACTIVITY.TYPE.SMS) || ((campaignData.communication_type === ACTIVITY.TYPE.WHATSAPP_BOTIFY))) && (r.mobile_number !== "") && r.mobile_number) {
                return sendPostRequest(request, ulmsConfig);
            }
            if((campaignData.communication_type === ACTIVITY.TYPE.EMAIL) && (r.email !== "") && r.email) {
                return sendPostRequest(request, ulmsConfig);
            }
        });
        const result = await Promise.all(promises);
        return result;
    }
    catch(err) {
        ErrorLog.addErrorLog('Error in updateActivity : ', err);
        console.log("Error in updateActivity", err);
        throw err;
    }
}