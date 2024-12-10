const Campaign = require('./Campaign');
const CampaignModel = require('../models/common/CampaignModel');
const ScheduleCampaignApiModel = require('../models/api/ScheduleCampaignApiModel');
const ScheduleApiModel = require('../models/api/ScheduleApisModel');
const CommonHelper = require('../../../helpers/CommonHelper');

/**
 * Class representing an API Campaign.
 * @extends Campaign
 */
class APICampaign extends Campaign {
    constructor() {
        super();
    }

    /**
     * Retrieves records for scheduling API campaigns.
     * @returns {Promise<Array>} A promise that resolves to an array of campaign records.
     */
    async getRecordsForScheduling() {
        return await CampaignModel.getCampaignforScheduleApis();
    }

    /**
     * Creates schedules for API campaigns.
     * @param {Array} records - The records to be scheduled.
     * @returns {Promise} A promise that resolves when schedules are created.
     */
    async createSchedules(records) {
        return await ScheduleCampaignApiModel.bulkCreate(records);
    }

    /**
     * Fetches scheduled campaigns.
     * @returns {Promise<Array>} A promise that resolves to an array of scheduled campaigns.
     */
    async fetchScheduledCampaigns() {
        return await ScheduleCampaignApiModel.get();
    }

    /**
     * Updates a scheduled campaign.
     * @param {Object} data - The data to be updated.
     * @returns {Promise} A promise that resolves when the campaign is updated.
     */
    async updateScheduledCampaign(data) {
        return await ScheduleCampaignApiModel.update(data);
    }

    /**
     * Creates child schedules for a given campaign.
     * @param {Object} scheduleCampaign - The parent campaign for which child schedules are created.
     * @param {Array} polledData - The data obtained from polling.
     * @returns {Promise} A promise that resolves when child schedules are created.
     */
    async createChildren(scheduleCampaign, polledData) {
        try {
            const parsedConfig = JSON.parse(scheduleCampaign.config);
            const scheduleApisBulkData = polledData
                .filter(record => record && parsedConfig.path && parsedConfig.method)
                .map(record => ({
                    campaign_id: scheduleCampaign.campaign_id,
                    scheduled_campaign_api_id: scheduleCampaign.campaign_api_id,
                    request_path: parsedConfig.path,
                    request_method: parsedConfig.method,
                    request_headers: JSON.stringify(parsedConfig?.headers),
                    request_body: JSON.stringify(CommonHelper.replaceVariables(parsedConfig?.body, record) ?? parsedConfig?.body),
                    request_params: CommonHelper.replaceVariables(parsedConfig?.params, record) ?? parsedConfig?.params,
                    scheduled_at: record && record.scheduled_at,
                    timeout: parsedConfig?.timeout || 5000,
                }));

            if (scheduleApisBulkData.length === 0) {
                console.warn('No valid records found for bulk creation.');
                return;
            }

            await ScheduleApiModel.bulkCreate(scheduleApisBulkData);
            console.log('Bulk creation successful.');
        } catch (error) {
            console.error('Error in createChildren:', error.message);
            throw error;
        }
    }
}

module.exports = APICampaign;
