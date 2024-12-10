/* global CampaignModel, CampaignCommunicationModel, db, ERROR */

const moment = require('moment');
const CampaignModel = require('../models/common/CampaignModel');
const ScheduleCampaignModel = require('../models/communication/ScheduleCampaignModel');
const ScheduleCampaignRewardModel = require('../models/reward/ScheduleCampaignRewardModel');
const CommonHelper = require(HELPER_PATH + 'CommonHelper.js');
const CampaignFactory = require('../factories/CampaignFactory');

class CampaignService {
    constructor() {

    }
}

CampaignService.schedule = async (type) => {
    const campaign = CampaignFactory.getCampaignByType(type);
    const records = await campaign.getRecordsForScheduling();
    console.log('records', JSON.stringify(records));
    if (CommonHelper.isEmpty(records)) {
        return;
    }
    let schedulingData = [];
    for (let record of records) {
        let isValidExpression = CommonHelper.isValidCronExpression(record.cron_expression);
        if (!isValidExpression) {
            console.error(`cron expression wrong : ${record}`);
            continue;
        }
        let previousTime = CommonHelper.getPreviousCronTime(record.cron_expression);
        if (!moment().isSame(previousTime, 'minute')) {
            continue;
        }
        schedulingData.push(record);
    }
    console.log('schedulingData', JSON.stringify(schedulingData));
    if (CommonHelper.isEmpty(schedulingData)) {
        return;
    }
    await campaign.createSchedules(schedulingData);
}

module.exports = CampaignService;