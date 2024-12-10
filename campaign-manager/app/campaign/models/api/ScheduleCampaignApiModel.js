var MySqlDB = require('../../../../config/MySqlDB');
const CommonHelper = require('../../../../helpers/CommonHelper');
const DatabaseError = require('../../../error/DatabaseError');

class ScheduleCampaignApiModel {
  constructor() { }
}

ScheduleCampaignApiModel.get = async () => {
  try {
    const sqlDB = new MySqlDB();
    const query = `select sca.id as id, sca.last_offset as last_offset, c.id as campaign_id, ca.id as campaign_api_id, c.name as campaignName, c.query, c.query_param, c.db_type, c.handler, c.data_source, c.config, ca.config, ca.description as description from ${TABLE.SCHEDULED_CAMPAIGN_APIS} sca join ${TABLE.CAMPAIGNS} c on c.id = sca.campaign_id join ${TABLE.CAMPAIGN_APIS} ca on ca.id = sca.campaign_api_id where sca.status in ( '${config.scheduleCampaignStatus.NEW}' , '${config.scheduleCampaignStatus.PARTIAL_COMPLETED}' )`;
    console.log(query);
    const rows = await sqlDB.query(query);
    return rows;
  } catch (error) {
    console.error(error, JSON.stringify(error));
    throw new DatabaseError('Error in fetching Schedule campaign api', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_FETCH, error);
  }
};

ScheduleCampaignApiModel.create = async (data) => {

  try {
    const filteredData = {
      campaign_id: data.campaign_id,
      campaign_api_id: data.campaign_api_id,
      status: config.scheduleCampaignStatus.NEW,
      last_offset: 0,
    };
    const query = `INSERT INTO ${TABLE.SCHEDULED_CAMPAIGN_APIS} SET ?`;
    var sqlDB = new MySqlDB();
    let result = await sqlDB.query(query, filteredData);
    return result;
  } catch (error) {
    throw new DatabaseError('Error in creating Schedule campaign api', CONSTANTS.DATABASE_QUERY_TYPE.CREATE, error);
  }
};

ScheduleCampaignApiModel.bulkCreate = async (dataArray) => {
  try {
    const sqlDB = new MySqlDB();
    const records = _.map(dataArray, (data) => {
      const object = [data.id, data.campaign_api_id, config.scheduleCampaignStatus.NEW, 0];
      return object;
    });
    console.log(JSON.stringify(records));
    const query = `insert into ${TABLE.SCHEDULED_CAMPAIGN_APIS} (campaign_id, campaign_api_id, status, last_offset) values ?`;
    await sqlDB.query(query, [records]);
    return;
  } catch (error) {
    console.error(`Error in bulk inserting in schedule apis campaign error: ${error}`);
    throw new DatabaseError('Error in creating schedule apis campaign', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_CREATE, JSON.stringify(error));
  }
}

ScheduleCampaignApiModel.update = async (data) => {
  try {
    const id = data.id;
    if (!id) {
      return;
    }
    let updateData = {};
    if (data.hasOwnProperty('status')) {
      updateData.status = data.status;
    }
    if (data.hasOwnProperty('last_offset')) {
      updateData.last_offset = data.last_offset;
    }
    if (CommonHelper.isEmpty(updateData)) {
      return;
    }
    const sqlDB = new MySqlDB();
    const query = `update ${TABLE.SCHEDULED_CAMPAIGN_APIS} SET ? where id = ${id}`;
    const result = sqlDB.query(query, updateData);
    return result;
  } catch (error) {
    throw new DatabaseError('Error in updating schedule campaign apis', CONSTANTS.DATABASE_QUERY_TYPE.UPDATE, error);
  }
};

module.exports = ScheduleCampaignApiModel;
