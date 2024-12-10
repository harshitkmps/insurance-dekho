const Campaign = require('./Campaign');
const CampaignModel = require('../models/common/CampaignModel');
const ScheduleCampaignModel = require('../models/communication/ScheduleCampaignModel');
var moment = require('moment');
var CommonHelper = require(HELPER_PATH + 'CommonHelper.js');
var ScheduleCommunicationModel = require('../models/communication/ScheduleCommunicationModel');

class CommunicationCampaign extends Campaign{
    constructor() {
        super();
    }

    async getRecordsForScheduling() { 
        return await CampaignModel.getCampaignForScheduler();
    }

    async createSchedules(records) {
        return await ScheduleCampaignModel.bulkCreate(records);
    }

    async fetchScheduledCampaigns() {
        return await ScheduleCampaignModel.getScheduleCampaignData();
    }

    async updateScheduledCampaign(data) {
        return await ScheduleCampaignModel.updateScheduleCampaignStatus(data);
    }


    async computeTemplateName(params,record) {
        let newtemplate;
        let newScheduledDateTime;
        const campaignsTobeSentAt10Am = ['travel_proposal_dropoff_whatsapp_2days', 'travel_payment_dropoff_whatsapp_2days'];
        if (record && record.template_name){
            newtemplate = record.template_name;
            newScheduledDateTime = moment().format('YYYY-MM-DD');
        }else if(params && record && params.template_name === 'health_botify_campaign') {
            if(([CONSTANTS.HEALTH_CONSTANTS.crmStatus.FRESH.SS.NOT_YET_CALLED].includes(record.sub_status_id)) && !record.meeting_sub_status_id) {
                newtemplate = 'fus_custdrop_callnotattempt';
                newScheduledDateTime = moment(moment().format('YYYY-MM-DD')).add(10,'hours');
            }
            else if(([CONSTANTS.HEALTH_CONSTANTS.crmStatus.RIGHT_PARTY_CONTACT.ID,CONSTANTS.HEALTH_CONSTANTS.crmStatus.NOT_CONTACTABLE.ID].includes(record.status_id)) && !record.meeting_sub_status_id && record.first_connected && moment(record.first_connected).format('YYYY-MM-DD HH:mm:ss') >= moment().local().subtract(3,"days").format('YYYY-MM-DD')) {
                newtemplate = 'fus_custdrop_interestnotgather';
                newScheduledDateTime = moment(moment().format('YYYY-MM-DD')).add(10,'hours');
            }
            else if([CONSTANTS.HEALTH_CONSTANTS.crmStatus.INTERSTED.ID].includes(record.status_id) && ![CONSTANTS.HEALTH_CONSTANTS.crmStatus.INTERSTED.SS.PAYMENT_DONE].includes(record.sub_status_id) && !record.meeting_sub_status_id && record.first_moved_to_interested && moment(record.first_moved_to_interested).format('YYYY-MM-DD HH:mm:ss') >= moment().local().subtract(3,"days").format('YYYY-MM-DD')) {
                newtemplate = 'fus_custdrop_b2cnotpaid';
                newScheduledDateTime = moment(moment().format('YYYY-MM-DD')).add(10,'hours');
            }
            else if(record.meeting_sub_status_id && record.meeting_sub_status_id == CONSTANTS.HEALTH_CONSTANTS.meetingStatus.REQUESTED.SS.ID) {
                newtemplate = 'fus_custdrop_meetnotsched';
                newScheduledDateTime = moment(moment().format('YYYY-MM-DD')).add(10,'hours');
            }
            else if(([CONSTANTS.HEALTH_CONSTANTS.crmStatus.NOT_CONTACTABLE.ID].includes(record.status_id)) && !record.meeting_sub_status_id && record.first_attempted && moment(record.first_attempted).format('YYYY-MM-DD HH:mm:ss') >= moment().local().subtract(3,"days").format('YYYY-MM-DD')) {
                newtemplate = 'fus_custdrop_callnotconnect';
                newScheduledDateTime = moment(moment().format('YYYY-MM-DD')).add(10,'hours');

            }
        }
        // else if(params && params.template_name == 'health_botify_meeting_campaign') {
        //     newtemplate = 'fus_custdrop_meetnotdone';
        //     newScheduledDateTime = moment(moment().format('YYYY-MM-DD')).add(10,'hours');
        // }
        if (params && params.campaignName && campaignsTobeSentAt10Am.includes(params.campaignName)) {
            newScheduledDateTime = moment(moment().format('YYYY-MM-DD')).add(10,'hours');
        }
        return {newtemplate, newScheduledDateTime};
    }

    async createChildren(scheduleCampaign, polledData) {
        var insertDataArr = [];
        let i = 0;
        for (let record of polledData) {
            if (record.email || record.mobile_number) {
                let email = '';
                let mobile = '';
                if (scheduleCampaign.communication_type == config.communicationType.EMAIL) {
                    email = record.email || '';
                } else {
                    mobile = record.mobile_number || '';
                }
                let chkRecord;
                if(scheduleCampaign.ignoreDuplicateRecord && record.reference_id){
                    chkRecord = await ScheduleCommunicationModel.checkRecordExistWithoutDuplicate(scheduleCampaign.campaign_id, scheduleCampaign.communication_type, record.reference_id);
                }else{
                    chkRecord = await ScheduleCommunicationModel.checkRecordExists(scheduleCampaign.campaign_id, scheduleCampaign.communication_type, mobile, email);
                }
                if (chkRecord) {
                    for (let count of chkRecord) {
                        if (count.hasOwnProperty('count') && !count.count) {
                            let j = 0;
                            let parsedTemplateVariables = {};
                            if (scheduleCampaign.hasOwnProperty("template_variable") && !CommonHelper.isEmpty(scheduleCampaign.template_variable)) {
                                try{
                                    // if needs to shorten the url
                                    if( scheduleCampaign.hasOwnProperty("is_shorten_url") && scheduleCampaign.is_shorten_url && record.hasOwnProperty("url") && record.url){

                                        const shorten_url = await CommonHelper.getShortenUrlFromITMS(record.url);

                                        if( shorten_url.hasOwnProperty("url") && !CommonHelper.isEmpty(shorten_url.url)){
                                            record.url = shorten_url.url;
                                        }
                                    }
                                }catch(err){
                                    console.error("Error:",err);
                                }
                                
                                parsedTemplateVariables = await ScheduleCommunicationModel.parseTemplateVariable(scheduleCampaign.template_variable, record);
                            }
                            const computedData = await this.computeTemplateName(scheduleCampaign,record);
                            insertDataArr[i] = [];
                            insertDataArr[i][j++] = scheduleCampaign.campaign_id ? scheduleCampaign.campaign_id : '';
                            insertDataArr[i][j++] = scheduleCampaign.communication_type ? scheduleCampaign.communication_type.trim() : '';
                            insertDataArr[i][j++] = (computedData && computedData['newtemplate']) ? computedData['newtemplate'] : (scheduleCampaign.template_name ? scheduleCampaign.template_name.trim() : '');
                            insertDataArr[i][j++] = scheduleCampaign.template_variable ? parsedTemplateVariables : null;
                            insertDataArr[i][j++] = record.recipient_name ? record.recipient_name : '';
                            insertDataArr[i][j++] = record.mobile_number ? record.mobile_number : null;
                            insertDataArr[i][j++] = record.email ? record.email : null;
                            insertDataArr[i][j++] = record.reference_id ? record.reference_id : '';
                            insertDataArr[i][j++] = record.reference_timestamp ? record.reference_timestamp : moment().format('YYYY-MM-DD HH:mm:ss');
                            insertDataArr[i][j++] = scheduleCampaign.data_source ? scheduleCampaign.data_source : '';
                            insertDataArr[i][j++] = scheduleCampaign.product_category ? scheduleCampaign.product_category : '';
                            insertDataArr[i][j++] = scheduleCampaign.product_sub_category ? scheduleCampaign.product_sub_category : null;
                            insertDataArr[i][j++] = (computedData && computedData.newScheduledDateTime) ? moment(computedData.newScheduledDateTime).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss');
                    
                        }
                    }
                }
            }
            i++;
        }
        insertDataArr = _.compact(insertDataArr);
        if (insertDataArr.length == 0) {
            return;
        }
        await ScheduleCommunicationModel.addBulkScheduleCommunication(insertDataArr);
    }
}

module.exports = CommunicationCampaign;