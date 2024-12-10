var MySqlDB = require('../../../../config/MySqlDB');
const DatabaseError = require('../../../error/DatabaseError');
const moment = require('moment');
const CommonHelper = require(HELPER_PATH + 'CommonHelper.js');

class ScheduleRewardsModel {
  constructor() { }
}

ScheduleRewardsModel.getByStatus = async (status) => {
  try {
    const sqlDB = new MySqlDB();
    const query = `SELECT * FROM ${TABLE.SCHEDULED_REWARDS} WHERE STATUS = ${status} LIMIT 1000`;
    const result = await sqlDB.query(query);
    return result;
  } catch (error) {
    throw new DatabaseError('Error in fetching schedule rewards', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_FETCH, JSON.stringify(error));
  }
};

ScheduleRewardsModel.bulkCreate = async (arrayData) => {
  try {
    if (!arrayData.length) {
      return;
    }
    let orderedData = [];
    _.each(arrayData, (row) => {
      let filteredRowValues = [];
      let i = 0;
      filteredRowValues[i++] = row.scheduled_campaign_reward_id;
      filteredRowValues[i++] = row.campaign_id;
      filteredRowValues[i++] = row.rule_identifier;
      filteredRowValues[i++] = row.tenant;
      filteredRowValues[i++] = row.points_type;
      filteredRowValues[i++] = moment().format('YYYY-MM-DD HH:mm:ss');
      filteredRowValues[i++] = row.description;
      filteredRowValues[i++] = row.user_id;
      filteredRowValues[i++] = row.user_id_type || 'gcd';
      filteredRowValues[i++] = JSON.stringify(row.meta_data);
      filteredRowValues[i++] = row.unique_id_format;
      filteredRowValues[i++] = CONSTANTS.SCHEDULED_REWARDS.CREATED; // status
      // filteredRowValues[i++] = 0; // issent
      orderedData.push(filteredRowValues);
    });
    const query = `insert into ${TABLE.SCHEDULED_REWARDS} (scheduled_campaign_reward_id, campaign_id, rule_identifier, tenant, points_type, allocation_date, description, user_id, user_id_type, meta_data, unique_id_format, status) values ?`;
    const sqlDB = new MySqlDB();
    const result = await sqlDB.query(query, [orderedData]);
    return result;
  } catch (error) {
    console.error(`Error in bulk inserting in schedule rewards error: ${error}`);
    throw new DatabaseError('Error in creating schedule rewards', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_CREATE, error);
  }
};

ScheduleRewardsModel.update = async (data) => {
  try {
    const { id, status, unique_id, points, failure_type, sent_at } = data;
    let updateData = {};
    if (!id) {
      return;
    }
    if (status) {
      updateData.status = status;
    }
    if (unique_id) {
      updateData.unique_id = unique_id;
    }
    if (points) {
      updateData.points = points;
    }
    if (sent_at) {
      updateData.sent_at = sent_at;
    }
    if (failure_type) {
      updateData.failure_type = failure_type;
    }
    if (CommonHelper.isEmpty(updateData)) {
      return;
    }
    const query = `UPDATE ${TABLE.SCHEDULED_REWARDS} SET ? WHERE id = ${id}`;
    const sqlDB = new MySqlDB();
    await sqlDB.query(query, updateData);
    return;
  } catch (error) {
    // catch error
    console.error(`error in updating scheduled rewards, error${JSON.stringify(error)}`);
    throw new DatabaseError('Error in updating schedule rewards', CONSTANTS.DATABASE_QUERY_TYPE.UPDATE, error);
  }
}

module.exports = ScheduleRewardsModel;