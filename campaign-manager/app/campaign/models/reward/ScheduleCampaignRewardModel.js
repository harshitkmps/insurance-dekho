var MySqlDB = require('../../../../config/MySqlDB');
const CommonHelper = require('../../../../helpers/CommonHelper');
const DatabaseError = require('../../../../app/error/DatabaseError');

class ScheduleCampaignRewardModel {
  constructor() { }
}

ScheduleCampaignRewardModel.get = async () => {
  try {
    const sqlDB = new MySqlDB();
    const query = `select scr.id as id, scr.last_offset as last_offset, c.id as campaign_id, cr.id as campaign_reward_id, c.name as campaignName, c.query, c.query_param, c.db_type, c.handler, c.data_source, c.config, cr.unique_id_format as unique_id_format, cr.rule_identifier as rule_identifier, cr.tenant as tenant, cr.points_type as points_type, cr.description as description from ${TABLE.SCHEDULED_CAMPAIGN_REWARDS} scr join ${TABLE.CAMPAIGNS} c on c.id = scr.campaign_id join ${TABLE.CAMPAIGN_REWARDS} cr on cr.id = scr.campaign_reward_id where scr.status in ( '${config.scheduleCampaignStatus.NEW}' , '${config.scheduleCampaignStatus.PARTIAL_COMPLETED}' )`;
    console.log(query);
    const rows = await sqlDB.query(query);
    return rows;
  } catch (error) {
    console.error(error, JSON.stringify(error));
    throw new DatabaseError('Error in fetching Schedule campaign reward', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_FETCH, error);
  }
};

ScheduleCampaignRewardModel.create = async (data) => {

  try {
    const filteredData = {
      campaign_id: data.campaign_id,
      campaign_reward_id: data.campaign_reward_id,
      status: config.scheduleCampaignStatus.NEW,
      last_offset: 0,
    };
    const query = `INSERT INTO ${TABLE.SCHEDULED_CAMPAIGN_REWARDS} SET ?`;
    var sqlDB = new MySqlDB();
    let result = await sqlDB.query(query, filteredData);
    return result;
  } catch (error) {
    throw new DatabaseError('Error in creating Schedule campaign reward', CONSTANTS.DATABASE_QUERY_TYPE.CREATE, error);
  }
};

ScheduleCampaignRewardModel.bulkCreate = async (dataArray) => {
  try {
    const sqlDB = new MySqlDB();
    const records = _.map(dataArray, (data) => {
      const object = [data.id, data.campaign_reward_id, config.scheduleCampaignStatus.NEW, 0];
      return object;
    });
    console.log(JSON.stringify(records));
    const query = `insert into ${TABLE.SCHEDULED_CAMPAIGN_REWARDS} (campaign_id, campaign_reward_id, status, last_offset) values ?`;
    await sqlDB.query(query, [records]);
    return;
  } catch (error) {
    console.error(`Error in bulk inserting in schedule rewards campaign error: ${error}`);
    throw new DatabaseError('Error in creating schedule rewards campaign', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_CREATE, JSON.stringify(error));
  }
}

ScheduleCampaignRewardModel.update = async (data) => {
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
    const query = `update ${TABLE.SCHEDULED_CAMPAIGN_REWARDS} SET ? where id = ${id}`;
    const result = sqlDB.query(query, updateData);
    return result;
  } catch (error) {
    throw new DatabaseError('Error in updating schedule campaign rewards', CONSTANTS.DATABASE_QUERY_TYPE.UPDATE, error);
  }
};

module.exports = ScheduleCampaignRewardModel;
