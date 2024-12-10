const MySqlDB = require('../../../../config/MySqlDB');
const DatabaseError = require('../../../error/DatabaseError');
const CommonHelper = require(HELPER_PATH + 'CommonHelper.js');
const moment = require('moment');

class ScheduleApisModel {
    constructor() { }
}

/**
 * Gets scheduled APIs by status and scheduled time.
 *
 * @param {number} status - The status of scheduled APIs to retrieve.
 * @returns {Promise<Array>} - An array of scheduled APIs.
 * @throws {DatabaseError} - If an error occurs during the database operation.
 */
ScheduleApisModel.getByStatus = async (status) => {
    try {
        const sqlDB = new MySqlDB();
        const query = `
            SELECT sa.*, ca.config as campaign_api_config
            FROM ${TABLE.SCHEDULED_APIS} sa
            JOIN ${TABLE.CAMPAIGN_APIS} ca ON (sa.scheduled_campaign_api_id = ca.id)
            WHERE sa.status = ${status} AND sa.scheduled_at <= NOW()
            ORDER BY sa.scheduled_at ASC
            LIMIT 100
        `;
        const result = await sqlDB.query(query);
        return result;
    } catch (error) {
        console.error(`Error in fetching in scheduled APIs: ${error}`);
        throw new DatabaseError('Error in fetching schedule API', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_FETCH, JSON.stringify(error));
    }
};

/**
 * Bulk inserts scheduled APIs into the database.
 *
 * @param {Array} arrayData - Array of scheduled API data to insert.
 * @returns {Promise} - A promise indicating the success of the operation.
 * @throws {DatabaseError} - If an error occurs during the database operation.
 */
ScheduleApisModel.bulkCreate = async (arrayData) => {
    try {
        if (!arrayData.length) {
            return;
        }
        const orderedData = arrayData.map((row) => [
            row.scheduled_campaign_api_id,
            row.campaign_id,
            CONSTANTS.SCHEDULED_API_STATUS.CREATED,
            row.scheduled_at || moment().local().format('YYYY-MM-DD HH:mm:ss'),
            row.request_path,
            row.request_method,
            row.request_body,
            row.request_params,
        ]);
        const query = `
      INSERT INTO ${TABLE.SCHEDULED_APIS}
      (scheduled_campaign_api_id, campaign_id, status, scheduled_at, request_path, request_method, request_body, request_params)
      VALUES ?
    `;
        const sqlDB = new MySqlDB();
        const result = await sqlDB.query(query, [orderedData]);
        return result;
    } catch (error) {
        console.error(`Error in bulk inserting in scheduled APIs: ${error}`);
        throw new DatabaseError('Error in creating scheduled APIs', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_CREATE, error);
    }
};

/**
 * Updates the status and sent_at of a scheduled API.
 *
 * @param {Object} data - Data containing the ID, status, and sent_at for update.
 * @param {number} data.id - The ID of the scheduled API.
 * @param {number} data.status - The new status of the scheduled API.
 * @param {string} data.sent_at - The sent_at timestamp.
 * @returns {Promise} - A promise indicating the success of the operation.
 * @throws {DatabaseError} - If an error occurs during the database operation.
 */
ScheduleApisModel.update = async (data) => {
    try {
        const { id, status, sent_at } = data;
        let updateData = {};
        if (!id) {
            return;
        }
        if (status) {
            updateData.status = status;
        }
        if (sent_at) {
            updateData.sent_at = sent_at;
        }
        if (CommonHelper.isEmpty(updateData)) {
            return;
        }
        const query = `UPDATE ${TABLE.SCHEDULED_APIS} SET ? WHERE id = ${id}`;
        const sqlDB = new MySqlDB();
        await sqlDB.query(query, updateData);
        return;
    } catch (error) {
        console.error(`Error in updating scheduled APIs: ${JSON.stringify(error)}`);
        throw new DatabaseError('Error in updating scheduled APIs', CONSTANTS.DATABASE_QUERY_TYPE.UPDATE, error);
    }
};

module.exports = ScheduleApisModel;
