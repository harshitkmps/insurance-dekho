var moment              = require('moment');
var MySqlDB = require('../../../../config/MySqlDB');
const DatabaseError = require('../../../../app/error/DatabaseError');

let Campaign = {}

Campaign.addCampaign =  function(data){
    return new Promise( async function(resolve, reject) {
        let campaign = {
          uuid: data.uuid ? data.uuid : "",
          name: data.name ? data.name.trim() : "",
          description: data.description ? data.description : "",
          start_date: data.start_date ? data.start_date : null,
          end_date: data.end_date ? data.end_date : null,
          type: data.type ? data.type : CONSTANTS.CAMPAIGN_TYPE.COMMUNICATION,
          query: data.query ? data.query : "",
          query_param: data.query_param ? data.query_param : "",
          db_type: data.db_type ? data.db_type : "",
          data_source: data.data_source ? data.data_source : "",
          config: data.config ? data.config : "",
          status: data.status ? data.status : 0,
          handler: data.handler ? data.handler : '',
          created_by: data.created_by ? data.created_by : "",
          updated_by: data.updated_by ? data.updated_by : "",
        };
        
        try{
            var sqlDB = new MySqlDB();
            let query = 'INSERT INTO '+TABLE.CAMPAIGNS+' SET ?';
            let result = await sqlDB.query(query, campaign);
            if(result){
                resolve(result.insertId)
            }else{
                throw ERROR.DEFAULT_ERROR;
            }
        }catch(e){
            reject(e);
        }
    });
}

Campaign.updateCampaign =  function(data){
    return new Promise( async function(resolve, reject) {
        var campaign    = {};   

        if(data.hasOwnProperty('name')){
            campaign.name = data.name;
        }
        if(data.hasOwnProperty('description')){
            campaign.description = data.description;
        }        
        if(data.hasOwnProperty('start_date')){
            campaign.start_date = data.start_date?data.start_date:null;
        }
        if(data.hasOwnProperty('end_date')){
            campaign.end_date = data.end_date?data.end_date:null;
        }
        if (data.hasOwnProperty('type')) { 
            campaign.type = data.type ? data.type : CONSTANTS.CAMPAIGN_TYPE.COMMUNICATION;
        }
        if(data.hasOwnProperty('query')){
            campaign.query = data.query;
        }
        if(data.hasOwnProperty('query_param')){
            campaign.query_param = data.query_param?data.query_param:'';
        }
        if(data.hasOwnProperty('db_type')){
            campaign.db_type = data.db_type;
        }
        if(data.hasOwnProperty('data_source')){
            campaign.data_source = data.data_source;
        }
        if(data.hasOwnProperty('config')){
            campaign.config = data.config?data.config:'';
        }
        if(data.hasOwnProperty('status')){
            campaign.status = data.status?data.status:0;
        }
        if(data.hasOwnProperty('updated_by')){
            campaign.updated_by = data.updated_by;
        }

        campaign.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
        
        try{
            var sqlDB = new MySqlDB();
            let query = 'UPDATE '+TABLE.CAMPAIGNS+' SET ? WHERE id = ?';
            let result = await sqlDB.query(query, [campaign, data.id]);
            if(result){
                resolve(result.affectedRows)
            }else{
                throw ERROR.DEFAULT_ERROR;
            }
        }catch(e){
            reject(e);
        }
    });
}

Campaign.getCampaign =  function(id = false, dateCheck = false){
    return new Promise( async function(resolve, reject) {
        try{
            var sqlDB = new MySqlDB();
            let query = 'SELECT id, uuid, name, description, start_date, end_date, type, query, query_param, db_type, data_source, config, status FROM '+TABLE.CAMPAIGNS+' WHERE 1=1';
            if(id){
                query += ' AND id = '+id; 
            }
            
            if(dateCheck) {
                query += ' AND start_date <= '+ dateCheck;
            }

            let rows = await sqlDB.query(query);
            if(rows){
                resolve(rows)
            }
        }catch(e){
            reject(e);
        }
    });
}

Campaign.getCampaignForScheduler = () => {
  return new Promise(async function (resolve, reject) {
    try {
      var sqlDB = new MySqlDB();
      let query = `SELECT c.id, c.type as type, cc.id as communicationId, c.start_date, c.end_date, cc.cron_expression FROM ${TABLE.CAMPAIGNS} c join ${TABLE.CAMPAIGN_COMMUNICATIONS} cc on c.id = cc.campaign_id where c.start_date <= now() and (CASE WHEN c.end_date IS NULL THEN "9999-01-01" ELSE c.end_date END) > now() AND c.status=0 AND cc.status=0 and (type is NULL or  type = '${CONSTANTS.CAMPAIGN_TYPE.COMMUNICATION}')`;
      let rows = await sqlDB.query(query);
      if (rows) {
        resolve(rows);
      }
    } catch (e) {
      reject(e);
    }
  });
};

Campaign.getCampaignforScheduleRewards = async () => {
    try {
        const sqlDB = new MySqlDB();
        const query = `select c.id, c.type as type, cr.id as campaign_reward_id, c.start_date, c.end_date, cr.cron_expression FROM ${TABLE.CAMPAIGNS} c join ${TABLE.CAMPAIGN_REWARDS} cr on c.id = cr.campaign_id where c.start_date <= now() and (CASE WHEN c.end_date IS NULL THEN "9999-01-01" ELSE c.end_date END) > now() AND c.status=0 AND cr.status=0 AND type = '${CONSTANTS.CAMPAIGN_TYPE.REWARD}'`;
        let rows = await sqlDB.query(query);
        return rows;
    } catch (error) {
        console.error(error);
        throw new DatabaseError('Error in updating campaigns status', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_FETCH, JSON.stringify(error));
    }
}

Campaign.getCampaignforScheduleApis = async () => {
    try {
        const sqlDB = new MySqlDB();
        const query = `select c.id, c.type as type, ca.id as campaign_api_id, c.start_date, c.end_date, ca.cron_expression FROM ${TABLE.CAMPAIGNS} c join ${TABLE.CAMPAIGN_APIS} ca on c.id = ca.campaign_id where c.start_date <= now() and (CASE WHEN c.end_date IS NULL THEN "9999-01-01" ELSE c.end_date END) > now() AND c.status=0 AND ca.status=0 AND type = '${CONSTANTS.CAMPAIGN_TYPE.API}'`;
        const rows = await sqlDB.query(query);
        return rows;
    } catch (error) {
        console.error(error);
        throw new DatabaseError('Error in updating campaigns status', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_FETCH, JSON.stringify(error));
    }
}

Campaign.updateCampaignStatus = async (campaignIds, status) => {
    try {
        const sqlDB = new MySqlDB();
        const query = `update ${TABLE.CAMPAIGNS} set status = ${status} where id in (?)`;
        await sqlDB.query(query, [campaignIds]);
        return;
    } catch (error) {
        throw new DatabaseError('Error in updating campaigns status', CONSTANTS.DATABASE_QUERY_TYPE.BATCHUPDATE, JSON.stringify(error));
    }
};


module.exports = Campaign;
