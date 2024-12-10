const CampaignFactory = require('../factories/CampaignFactory');
var CommonHelper = require(HELPER_PATH + 'CommonHelper.js');
var DbConnectionHelper = require(HELPER_PATH + 'DbConnectionHelper.js');
var TpQueryLogModel = require('../../common/models/TpQueryLogModel');
const { handlePolledData } = require("../handlers");

class PollingService { 
    constructor() { }
}

const replaceQueryParameter = (query, queryParam) => {
    for (let key in queryParam) {
        query = query.replace('{' + key + '}', queryParam[key]);
    }
    return query;
}

function addLimitOffsetToMongoQuery(query, limit, offset) {
    const isFindQuery = query.includes(".find(");
    const isAggregateQuery = query.includes(".aggregate(");

    if (isFindQuery) {
        const limitQuery = limit ? `.limit(${limit})` : '';
        const offsetQuery = offset ? `.skip(${offset})` : '';
        return query + limitQuery + offsetQuery + '.toArray()';
    } else if (isAggregateQuery) {
        const lastIndex = query.lastIndexOf('}');
        const modifiedQueryString = query.slice(0, lastIndex) +
            `}, { $limit: ${limit || 1000} }, { $skip: ${offset || 0} }])` + '.toArray()';
        return modifiedQueryString;
    } else {
        const error = "Invalid query format. Cannot add limit and offset.";
        console.error(query, error);
        throw new Error(error);
    }
}

const appendLimitAndOffset = (query, queryLimit, offset, dbSource, dbType) => {
    if (dbSource == 'presto') {
        return `${query} offset ${offset} limit ${queryLimit}`;
    } else if (dbType == 'mongodb') {
        return addLimitOffsetToMongoQuery(query, queryLimit, offset);
    } else {
        return `${query} limit ${queryLimit} offset ${offset}`;
    }
}

const logQuery = async (query, queryResult, scheduleCampaign) => {
    let querylogData = {
        db_type: scheduleCampaign.db_type,
        data_source: scheduleCampaign.data_source,
        campaign_id: scheduleCampaign.campaign_id,
    };
    await TpQueryLogModel.addQueryLog(query, querylogData, queryResult);
}

const pollData = async (query, scheduleCampaign) => {
    if (scheduleCampaign.data_source == 'presto') {
        return await DbConnectionHelper.executePrestoDBQuery(query);
    } else if (scheduleCampaign.handler) {
        const polledData = await DbConnectionHelper.executeQuery(query, scheduleCampaign.db_type, scheduleCampaign.data_source);
        return await handlePolledData(polledData, scheduleCampaign.handler, scheduleCampaign.commConf);
    } else {
        return await DbConnectionHelper.executeQuery(query, scheduleCampaign.db_type, scheduleCampaign.data_source);
    }
}

const processEachScheduleCampaign = async (campaign, scheduleCampaign) => {
    let updateScheduledCampaignData = {
        id: scheduleCampaign.id,
        status: config.scheduleCampaignStatus.IN_PROGRESS,
    };
    try {
        if (!scheduleCampaign.query || !scheduleCampaign.db_type || !scheduleCampaign.data_source) {
            await campaign.updateScheduledCampaign({
                id: scheduleCampaign.id,
                status: config.scheduleCampaignStatus.FAILED,
            });
            return;
        }
        await campaign.updateScheduledCampaign(updateScheduledCampaignData);
        const queryLimit = config.externalQueryLimit ? config.externalQueryLimit : 1000;
        let query = appendLimitAndOffset(scheduleCampaign.query, queryLimit, scheduleCampaign.last_offset, scheduleCampaign.data_source, scheduleCampaign.db_type);
        if (scheduleCampaign.query_param && !CommonHelper.isEmpty(scheduleCampaign.query_param)) {
            const queryParam = CommonHelper.getQueryParam(JSON.parse(scheduleCampaign.query_param));
            query = replaceQueryParameter(query, queryParam);
        }
        let queryResult = await pollData(query, scheduleCampaign);
        logQuery(query, queryResult, scheduleCampaign);
        await campaign.createChildren(scheduleCampaign, queryResult);
        updateScheduledCampaignData.status = queryResult.length == queryLimit ? config.scheduleCampaignStatus.PARTIAL_COMPLETED : config.scheduleCampaignStatus.COMPLETED;
        updateScheduledCampaignData.last_offset = scheduleCampaign.last_offset + queryResult.length;
        await campaign.updateScheduledCampaign(updateScheduledCampaignData);
    } catch (error) {
        console.error(`error in polling and creating bulk data error: ${JSON.stringify(error)}`);
        updateScheduledCampaignData = {
            id: scheduleCampaign.id,
            status: config.scheduleCampaignStatus.FAILED,
        };
        await campaign.updateScheduledCampaign(updateScheduledCampaignData);
    }
}

PollingService.pollAndScheduleData = async (type) => {
    const campaign = CampaignFactory.getCampaignByType(type);
    const scheduledCampaigns = await campaign.fetchScheduledCampaigns();
    if (scheduledCampaigns.length == 0) {
        return;
    }
    const promises = _.map(scheduledCampaigns, (scheduleCampaign) => {
        return processEachScheduleCampaign(campaign, scheduleCampaign);
    });
    await Promise.all(promises);
}

module.exports = PollingService;