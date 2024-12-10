const MySqlDB = require('../../../../config/MySqlDB');
const DatabaseError = require('../../../error/DatabaseError');

/**
 * Adds a campaign API record to the database.
 *
 * @param {Object} data - Data for new campaign API.
 * @param {string} data.campaign_id - The campaign ID.
 * @param {string} data.cron_expression - The cron expression.
 * @param {Object} data.config - The configuration data for the campaign.
 * @param {string} [data.description=''] - The api campaign description (optional).
 * @param {string} [data.handler=''] - The handler to be called (optional).
 * @returns {number} - The ID of the inserted record.
 * @throws {DatabaseError} - If an error occurs during database operation.
 */
const addCampaignApi = async (data) => {
    try {
        const recordData = {
            campaign_id: data.campaign_id,
            cron_expression: data.cron_expression,
            config: data.config,
            description: data.description ?? '',
            handler: data.handler ?? '',
        };

        const sqlDB = new MySqlDB();
        const query = `INSERT INTO ${TABLE.CAMPAIGN_APIS} SET ?`;
        const result = await sqlDB.query(query, recordData);

        return result.insertId;
    } catch (error) {
        console.error(error, JSON.stringify(error));
        throw new DatabaseError('Error in inserting campaign API', CONSTANTS.DATABASE_QUERY_TYPE.CREATE, error);
    }
};

module.exports = {
    addCampaignApi,
};
