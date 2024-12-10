let CampaignCommunication = {}
var MySqlDB = require('../../../../config/MySqlDB');

CampaignCommunication.addCampaignCommunication =  function(data){
    return new Promise( async function(resolve, reject) {
        let campaignCommunication    = {};
        
        campaignCommunication.campaign_id       = data.campaign_id?data.campaign_id:'';
        campaignCommunication.communication_type= data.communication_type?data.communication_type:'';             
        campaignCommunication.template_name     = data.template_name?data.template_name:'';
        campaignCommunication.template_variable = data.template_variable?data.template_variable:'';
        campaignCommunication.utm_source        = data.utm_source?data.utm_source:null;
        campaignCommunication.utm_medium        = data.utm_medium?data.utm_medium:'';
        campaignCommunication.utm_campaign      = data.utm_campaign?data.utm_campaign:'';
        campaignCommunication.cron_expression   = data.cron_expression?data.cron_expression:'';
        campaignCommunication.config            = data.config?data.config:'';
        campaignCommunication.is_shorten_url    = data.is_shorten_url ? data.is_shorten_url : 0;
        campaignCommunication.status            = data.status?data.status:0;
        campaignCommunication.created_by        = data.created_by?data.created_by:'';
        campaignCommunication.updated_by        = data.updated_by?data.updated_by:'';
        
        try{  
            var sqlDB = new MySqlDB();
            let query = 'INSERT INTO '+TABLE.CAMPAIGN_COMMUNICATIONS+' SET ?';
            let result = await sqlDB.query(query, campaignCommunication);
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

CampaignCommunication.updateCampaignCommunication =  function(data){
    return new Promise( async function(resolve, reject) {
        var campaignCommunication    = {};   

        if(data.hasOwnProperty('campaign_id')){
            campaignCommunication.campaign_id = data.campaign_id;
        }
        if(data.hasOwnProperty('communication_type')){
            campaignCommunication.communication_type = data.communication_type ? config.communicationType[data.communication_type.toUpperCase()] : '';
        }        
        if(data.hasOwnProperty('template_name')){
            campaignCommunication.template_name = data.template_name?data.template_name:'';
        }
        if(data.hasOwnProperty('template_variable')){
            campaignCommunication.template_variable = data.template_variable?data.template_variable:'';
        }
        if(data.hasOwnProperty('utm_source')){
            campaignCommunication.utm_source = data.utm_source;
        }
        if(data.hasOwnProperty('utm_medium')){
            campaignCommunication.utm_medium = data.utm_medium?data.utm_medium:'';
        }
        if(data.hasOwnProperty('utm_campaign')){
            campaignCommunication.utm_campaign = data.utm_campaign;
        }
        if(data.hasOwnProperty('cron_expression')){
            campaignCommunication.cron_expression = data.cron_expression;
        }
        if(data.hasOwnProperty('config')){
            campaignCommunication.config = data.config?data.config:'';
        }
        if(data.hasOwnProperty('is_shorten_url')){
            campaignCommunication.is_shorten_url = data.is_shorten_url ? data.is_shorten_url : 0;
        }
        if(data.hasOwnProperty('status')){
            campaignCommunication.status = data.status?data.status:0;
        }
        if(data.hasOwnProperty('updated_by')){
            campaignCommunication.updated_by = data.updated_by;
        }

        try{
            var sqlDB = new MySqlDB();
            let query = 'UPDATE '+TABLE.CAMPAIGN_COMMUNICATIONS+' SET ? WHERE id = ?';
            let result = await sqlDB.query(query, [campaignCommunication, data.id]);
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

CampaignCommunication.getCampaignCommunication =  function(id = false){
    return new Promise( async function(resolve, reject) {
        try{
            var sqlDB = new MySqlDB();
            let query = 'SELECT c.name as campaign_name, cc.communication_type, cc.template_name, cc.template_variable, cc.utm_source, cc.utm_medium, cc.utm_campaign, cc.cron_expression, cc.config, cc.status FROM '+TABLE.CAMPAIGN_COMMUNICATIONS+' cc JOIN '+TABLE.CAMPAIGNS+' c ON cc.campaign_id = c.id';
            if(id){
                query += ' WHERE cc.id = '+id; 
            }
            let rows = await sqlDB.query(query,{});
            if(rows){
                resolve(rows)
            }
        }catch(e){
            reject(e);
        }
    });
}


CampaignCommunication.getCampaignCommunicationByCampaignId =  function(campaignId = false){
    return new Promise( async function(resolve, reject) {
        try{
            var sqlDB = new MySqlDB();
            let query = 'SELECT * FROM '+TABLE.CAMPAIGN_COMMUNICATIONS+' WHERE campaign_id = '+campaignId;

            let rows = await sqlDB.query(query);
            if(rows){
                resolve(rows)
            }
        }catch(e){
            reject(e);
        }
    });
}

module.exports = CampaignCommunication;
