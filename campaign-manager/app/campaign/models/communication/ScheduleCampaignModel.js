const {resolve} = require('path');
var MySqlDB = require('../../../../config/MySqlDB');

class ScheduleCampaignModel {
    constructor() {

    }
}
ScheduleCampaignModel.getScheduleCampaignData = function () {
    return new Promise(async function (resolve, reject) {
        try {
            var sqlDB = new MySqlDB();
            let query = "select sc.id, c.id as campaign_id, cc.id as communicationId, c.name as campaignName, c.query, c.query_param, c.db_type, c.handler, c.data_source, c.config, cc.communication_type, cc.template_name, cc.template_variable, cc.cron_expression, cc.config as commConf, cc.is_shorten_url, sc.last_offset from scheduled_campaigns sc join campaigns c on sc.campaign_id = c.id join campaign_communications cc on sc.campaign_communication_id = cc.id where sc.status IN  ('"+config.scheduleCampaignStatus.NEW+"', '"+config.scheduleCampaignStatus.PARTIAL_COMPLETED+"')";
            console.log(query);
            let rows = await sqlDB.query(query);
            if (rows) {
                resolve(rows);
            }
        } catch (e) {
            reject(e)
        }
    });
};

ScheduleCampaignModel.getScheduleCampaignByCommunicationId = function (id) {
    return new Promise(async function (resolve, reject) {
        try {
            var sqlDB = new MySqlDB();
            let query = "select * from "+TABLE.SCHEDULED_CAMPAIGNS+" where status IN ('"+config.scheduleCampaignStatus.NEW+"', '"+config.scheduleCampaignStatus.PARTIAL_COMPLETED+"', '"+config.scheduleCampaignStatus.IN_PROGRESS+"') AND campaign_communication_id = '" + id + "'";
            let rows = await sqlDB.query(query);
            if (rows) {
                resolve(rows);
            }
        } catch (e) {
            reject(e)
        }
    });
};

ScheduleCampaignModel.updateScheduleCampaignStatus = function (data) {
    return new Promise(async function (resolve, reject) {
        var scheduleCampaign = {};

        if (data.hasOwnProperty('status')) {
            scheduleCampaign.status = data.status;
        }
        if (data.hasOwnProperty('last_offset')) {
            scheduleCampaign.last_offset = data.last_offset;
        }
        try {
            var sqlDB = new MySqlDB();
            let query = 'UPDATE '+TABLE.SCHEDULED_CAMPAIGNS+' SET ? WHERE id = ?';
            let result = await sqlDB.query(query, [scheduleCampaign, data.id]);
            if (result) {
                resolve(result.affectedRows)
            } else {
                throw ERROR.DEFAULT_ERROR;
            }
        } catch (e) {
            reject(e);
        }
    });
};

ScheduleCampaignModel.addScheduleCampaign = function (data) {
    return new Promise(async function (resolve, reject) {
        try {
            var sqlDB = new MySqlDB();
            let query = 'INSERT INTO '+TABLE.SCHEDULED_CAMPAIGNS+' SET ?';
            let result = await sqlDB.query(query, data);
            if (result) {
                resolve(result.insertId);
            } else {
                throw ERROR.DEFAULT_ERROR;
            }
        } catch (e) {
            reject(e);
        }
    });
};

ScheduleCampaignModel.bulkCreate = async (dataArray) => {
    try {
        const sqlDB = new MySqlDB();
        const records = _.map(dataArray, (data) => {
            const object = [data.id, data.communicationId, config.scheduleCampaignStatus.NEW, 0];
            return object;
        });
        const query = `insert into ${TABLE.SCHEDULED_CAMPAIGNS} (campaign_id, campaign_communication_id, status, last_offset) values ?`;
        await sqlDB.query(query, [records]);
    } catch (error) {
        console.error(`Error in bulk inserting in schedule communication campaign error: ${error}`);
        throw new DatabaseError('Error in creating schedule communication campaign', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_CREATE, JSON.stringify(error));
    }
}

module.exports = ScheduleCampaignModel;
