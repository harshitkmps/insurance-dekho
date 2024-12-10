var moment = require('moment');
const { LEAD_DROP } = require("../../../../config/constants");
const { sendPostRequest } = require("../../../../helpers/CommonHelper")
const ErrorLog = require('../../../common/models/ErrorLogModel');

exports.leadDrop = async function (records, campaignData) {   
    try {
        const promises = records.map(r => {
            const leadStep = r.stage_name + " - " + r.step_name;
            const request = {
                "communication_type" : "TIMED",
                "message_body" : {
                    "title" : LEAD_DROP.title,
                    "time" : moment(r.online_datetime).tz('Asia/Kolkata').format("LT"),
                    "leadId" : r.lead_id,
                    "leadName" : r.cust_name,
                    "type" : LEAD_DROP.svg,
                    "agentName" : null,
                    "stepName" : leadStep.slice(0,LEAD_DROP.stringLength) + "..."
                },
                "message_type" : "ALL",
                "priority" : "LOW",
                "to_user" : [],
                "is_active" : "ACTIVE",
                "status" : "READY",
                "sub_status" : "UNSENT",
                "start_date" : moment(new Date()).format('YYYY-MM-DD'),
                "end_date" : moment(new Date()).endOf('day').format('YYYY-MM-DD')
            }
            const ulmsConfig = {
                host : config.ulms_api.host,
                path : "/communication/v1/create",
                protocol : config.ulms_api.protocol,
                headers : {
                    'Content-Type': 'application/json',
                    "x-auth-id" : config.ulms_api.authId 
                }
            }
            if(LEAD_DROP.advisor && r.agent_id) {
                const req = request;
                req.to_user.push(r.agent_id);
                req.message_body.agentName = null;
                sendPostRequest(req, ulmsConfig);
            }
            if(LEAD_DROP.team_lead && r.team_lead_id && r.team_status){
                const req = request;
                req.to_user = [];
                req.to_user.push(r.team_lead_id);
                req.message_body.agentName = r.first_name ? r.last_name ? r.first_name + " " + r.last_name : r.first_name : '';
                sendPostRequest(req, ulmsConfig);
            }
            return; 
        });
        const result = await Promise.all(promises);
        return result;
    }
    catch(err) {
        ErrorLog.addErrorLog('Error in leadDrop handler : ', err);
        console.log("Error in leadDrop handler", err);
        throw err;
    }
}