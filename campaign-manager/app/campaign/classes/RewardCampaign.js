const Campaign = require('./Campaign');
const CampaignModel = require('../models/common/CampaignModel');
const ScheduleCampaignRewardModel = require('../models/reward/ScheduleCampaignRewardModel');
const ScheduleRewardModel = require('../models/reward/ScheduleRewardsModel');

class RewardCampaign extends Campaign{
    constructor() { 
        super();
    }

    async getRecordsForScheduling() {
        return await CampaignModel.getCampaignforScheduleRewards();
    }

    async createSchedules(records) {
        return await ScheduleCampaignRewardModel.bulkCreate(records);
    }

    async fetchScheduledCampaigns() {
        return await ScheduleCampaignRewardModel.get();
    }

    async updateScheduledCampaign(data) {
        return await ScheduleCampaignRewardModel.update(data);
    }

    async createChildren(scheduleCampaign, polledData) {
        let scheduleRewardsBulkData = [];
        _.each(polledData, (record) => {
          if (record.user_id) {
            const scheduleRewardObject = {
              user_id: record.user_id,
              user_id_type: record.user_id_type,
              campaign_id: scheduleCampaign.campaign_id,
              meta_data: _.omit(record, ['user_id', 'user_id_type']),
              scheduled_campaign_reward_id: scheduleCampaign.id,
              rule_identifier: scheduleCampaign.rule_identifier,
              tenant: scheduleCampaign.tenant,
              points_type: scheduleCampaign.points_type,
              description: scheduleCampaign.description,
              unique_id_format: scheduleCampaign.unique_id_format,
            };
            scheduleRewardsBulkData.push(scheduleRewardObject);
          }
        });
        if (scheduleRewardsBulkData.length == 0) {
          return;
        }
        await ScheduleRewardModel.bulkCreate(scheduleRewardsBulkData);
    }
}

module.exports = RewardCampaign;