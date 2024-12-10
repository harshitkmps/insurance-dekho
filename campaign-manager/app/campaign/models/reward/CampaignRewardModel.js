const MySqlDB = require('../../../../config/MySqlDB');
const DatabaseError = require('../../../../app/error/DatabaseError');

const addCampaignReward = async (data) => {
  try {
    let recordData = {
      campaign_id: data.campaign_id,
      cron_expression: data.cron_expression,
      config: data.config,
      unique_id_format: data.unique_id_format,
      rule_identifier: data.rule_identifier,
      tenant: data.tenant,
      points_type: data.points_type,
      description: data.description,
    };
    let sqlDB = new MySqlDB();
    const query = `INSERT INTO ${TABLE.CAMPAIGN_REWARDS} SET ?`;
    let result = await sqlDB.query(query, recordData);
    return result.insertId;
  } catch (error) {
    console.log(error, JSON.stringify(error));
    throw new DatabaseError('Error in inserting campaign reward', CONSTANTS.DATABASE_QUERY_TYPE.CREATE, error);
  }

};

module.exports = {
  addCampaignReward,
};
