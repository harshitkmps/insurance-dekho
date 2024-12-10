/* global db, ERROR */

var path    = require('path');
var qs      = require('qs');
var ScheduleCommunication  = require('../models/communication/ScheduleCommunicationModel');
var CommonHelper                = require(HELPER_PATH+'CommonHelper.js');
var CommunicationHelper         = require(HELPER_PATH+'CommunicationHelper.js');
var ErrorLogModel = require('../../common/models/ErrorLogModel');

class CommunicationService {
    constructor() {
        
    }
}

CommunicationService.arrangeByTemplate = function (records) {
    if(CommonHelper.isEmpty(records)) return [];

    const templateVsRecords = new Map();
    for(const record of records) {
        if((templateVsRecords.get(record.template_name) == null) || (templateVsRecords.get(record.template_name) == undefined)) {
            templateVsRecords.set(record.template_name,[]);
        }
        if((record.template_name != null) || (record.template_name != undefined)) {
            templateVsRecords.get(record.template_name).push(record);
        }
    }

    const listOfRecordsByTemplate = []; 
    templateVsRecords.forEach((recordsByTemplate) => listOfRecordsByTemplate.push(recordsByTemplate));

    return listOfRecordsByTemplate;
}

CommunicationService.sendCommunication = async function(req, res){
    try{
        const scheduledCommunications = await ScheduleCommunication.getRecords();
        const communicationByTemplates = this.arrangeByTemplate(scheduledCommunications)
        if(!CommonHelper.isEmpty(communicationByTemplates)) {
        for(const recordsOfCampaign of communicationByTemplates) {
        try{
        let dataToBulk = {};
        let bulkData = [];
        let bulkIds = [];
        let isSingleEmailSent = false;
        if(!CommonHelper.isEmpty(recordsOfCampaign)){          
            for(let scheduledCommunication of recordsOfCampaign){
                let j = 0;
                if(scheduledCommunication.communication_type) {
                    try{
                        dataToBulk = {
                            "template_name" : scheduledCommunication.template_name,
                            };
                        let data = {
                            "templateName" : scheduledCommunication.template_name,
                            "params" : JSON.parse(scheduledCommunication.template_variable),
                            "referenceId" : scheduledCommunication.id
                        };

                        let isCommunicationSent = false;

                        if(scheduledCommunication.communication_type == config.communicationType.SMS && config.communicationEnable.SMS){console.log('in sms send function');
                            data.to = scheduledCommunication.mobile_number;
                            isCommunicationSent = await CommunicationHelper.sendSMS(data);
                        }

                        if(scheduledCommunication.communication_type == config.communicationType.WHATSAPP && config.communicationEnable.WHATSAPP){
                            data.to = scheduledCommunication.mobile_number;
                            isCommunicationSent = await CommunicationHelper.sendWhatsapp(data);
                        }
                        if(scheduledCommunication.communication_type == config.communicationType.WHATSAPP_BOTIFY && config.communicationEnable.WHATSAPP_BOTIFY){
                            data.to = scheduledCommunication.mobile_number;
                            isCommunicationSent = await CommunicationHelper.sendWhatsappBotify(data);
                        }

                        if(scheduledCommunication.communication_type == config.communicationType.EMAIL && config.communicationEnable.EMAIL){
                            let prepData = {};
                            data.to = scheduledCommunication.email;
                            prepData = await this.prepareBulkEmailData(data);
                            bulkData.push(prepData);
                            bulkIds.push(scheduledCommunication.id);
                            isCommunicationSent = await CommunicationHelper.sendEmail(data);
                            if(isCommunicationSent)
                                isSingleEmailSent = true;
                        }

                        if(isCommunicationSent) {
                            await ScheduleCommunication.setCommunicationIsSent({'is_sent': 1, 'id':scheduledCommunication.id});
                        }
                    }catch(e){
                        console.log(e)
                        await ScheduleCommunication.setCommunicationIsSent({'is_sent': 2, 'id':scheduledCommunication.id});
                    }
                }
            }
            if(bulkData.length && !isSingleEmailSent) {
                console.log("------------------------- TRACK : Bulk Email Send ------------------------\n");
                await this.sendBulkEmail(bulkData, dataToBulk, bulkIds);
            }
        }
        } catch(e) {
            console.log(e,"Error in single campaign")
            await ErrorLogModel.addErrorLog('sendSingleCommunication', e);
        }
        }
        }
    } catch (e) {
        await ErrorLogModel.addErrorLog('sendCommunication', e);
        console.log(e);
    }
    
}

CommunicationService.sendBulkEmail = async function (bulkData, dataToBulk, bulkIds) {
    if(bulkData.length) {
        let updateData = [''];
        try {
            Object.assign(dataToBulk, {"data": bulkData});
            let bulkCommunicationSent = await CommunicationHelper.sendEmailBulk(dataToBulk);
            if(bulkCommunicationSent && 'data' in bulkCommunicationSent && 'statusCode' in bulkCommunicationSent && bulkCommunicationSent.statusCode == 200) {
                for(let sentData of bulkCommunicationSent.data) {
                    let i = 0;
                    if('statusCode' in sentData && sentData.statusCode == 200) {
                        bulkIds.push(sentData.referenceId);
                    }
                }
                try {
//                                var updateData = updateData.filter(function (el) {
//                                    return el != null;
//                                });
                        updateData['is_sent'] = 1;
                        updateData['ids'] = bulkIds;
                        let result = await ScheduleCommunication.updateBulkScheduleCommunication(updateData);
                        if (result) {
                            console.log(result);
                        }
                    } catch (e) {
                        await ErrorLogModel.addErrorLog('sendCommunication', e);
                        console.log(e);
                    }
            }
        } catch (err){
            console.log('error from comm service');
            updateData['ids'] = bulkIds;
            updateData['is_sent'] = 2;
            let result = await ScheduleCommunication.updateBulkScheduleCommunication(updateData);
            if (result) {
                console.log(result);
            }
            await ErrorLogModel.addErrorLog('sendCommunication', err);
            console.log(err);
        }
    }
}

CommunicationService.prepareBulkEmailData = async function (params) {
    var data = {};
    var to   = {};
    var cc   = {};
    if(params) {
        if(params.to){
            if(params.to instanceof Array){
                for(var i=0; i< params.to.length; i++){
                    to[params.to[i]] = '';
                }
            }else{
                to[params.to] = '';
            }
            data.to = JSON.stringify(to);
        }
        if(params.cc){
            if(params.cc instanceof Array){
                for(var i=0; i< params.cc.length; i++){
                    cc[params.cc[i]] = '';
                }
            }else{
                cc[params.cc] = '';
            }
            data.cc = JSON.stringify(cc);
        }
        data.template_name    = params.templateName;
        data.template_variable= JSON.stringify(params.params);
        data.reference_type   = 'Campaign Manager';
        data.reference_id     = params.referenceId;
        data.subject_variable = JSON.stringify(params.params);
    }
    return data;
}
module.exports = CommunicationService;
