
var CommonHelper = require('./CommonHelper');

module.exports = {

    sendSMS: function(params){
        console.log(params);
        return new Promise(async function(resolve, reject) {
            var data  = {};
            var smsTo = [];

            if(params.to){
                if(typeof params.to === 'string'){
                    smsTo[0] = params.to;
                }
                data.sent_to = JSON.stringify(smsTo);
            }
 
            data.template_name    = params.templateName;
            data.sms_variable     = JSON.stringify(params.params);
            data.reference_type   = 'Send SMS';
            data.reference_id     = params.referenceId;
                        
            try{
                let result = await CommonHelper.sendPostRequestToCommunication(data, '/send_sms');
                if(result.data && !result.hasOwnProperty('error')){
                    resolve(result.data);
                }else if(result.error){
                    throw result.error;                       
                }else{
                    throw ERROR.DEFAULT_ERROR;                        
                }                     
            }catch(e){
                reject(e);
            }   
        });
    },

    sendWhatsapp: function(params){
        return new Promise(async function(resolve, reject) {
            var data  = {};

            data.to               = params.to;
            data.campaign_code    = params.templateName;
            data.data_attributes  = params.params;
                        
            try{
                let result = await CommonHelper.sendPostRequestToCommunication(data, '/send_whatsapp');
                console.log(result)
                if(result.status && result.status == 200){
                    resolve(result.transaction_id);
                }else if(result.error){
                    throw result.error;                       
                }else{
                    throw ERROR.DEFAULT_ERROR;                        
                }                     
            }catch(e){
                reject(e);
            }   
        });
    },

    sendWhatsappBotify: function(params){
        return new Promise(async function(resolve, reject) {
            var data  = {};
            data.to                 = params.to;
            data.event_name         = params.templateName;
            data.context_variables  = params.params;
            data.company_handle     = config.whatsappBotify.company_handle,
            data.channel_type       = config.whatsappBotify.channel_type
            
            // handling additional params besdies required params
            data = await module.exports.payloadHandler(data, config.communicationType.WHATSAPP_BOTIFY);

            try{
                let result = await CommonHelper.sendPostRequestToCommunication(data, '/api/v2/HSM/send');
                console.log(result)
                if(result.statusCode && result.statusCode == 200 && result.data && result.data.transaction_id){
                    resolve(result.data.transaction_id);
                }else if(result.error){
                    throw result.error;                       
                }else{
                    throw ERROR.DEFAULT_ERROR;                        
                }                     
            }catch(e){
                reject(e);
            }   
        });
    },
        
    sendEmail: function(params){
        return new Promise(async function(resolve, reject) {
            var data = {};
            var to   = {};
            var cc   = {};

            if(params.to){
                if(params.to instanceof Array){
                    for(var i=0; i< params.to.length; i++){
                        to[params.to[i]] = '';
                    }
                }else{
                    to[params.to] = '';
                }
                data.to = JSON.stringify(to);
            }
            if(params.cc){
                if(params.cc instanceof Array){
                    for(var i=0; i< params.cc.length; i++){
                        cc[params.cc[i]] = '';
                    }
                }else{
                    cc[params.cc] = '';
                }
                data.cc = JSON.stringify(cc);
            }   

            data.template_name    = params.templateName;
            data.template_variable= JSON.stringify(params.params);
            data.reference_type   = 'Campaign Manager';
            data.reference_id     = params.referenceId;
            data.subject_variable = JSON.stringify(params.params);
            console.log("\n\n Mail to be sent to the user for template -->",  params.templateName);
            console.log("\n\n Mail data to be sent to the user -->", data);
            try{
                let result = await CommonHelper.sendPostRequestToCommunication(data, '/send_mail');
                if(result.data){
                    resolve(result.data);
                }else if(result.error){
                    throw result.error;                       
                }else{
                    throw ERROR.DEFAULT_ERROR;                        
                }                     
            }catch(e){
                reject(e);
            }   
        });
    },
    
    sendEmailBulk: function(data){
        return new Promise(async function(resolve, reject) {
            
            console.log(data);
                       
            try{
                let result = await CommonHelper.sendPostRequestToBulkCommunication(data, '/api/v2/send-bulk-email');
                if(result && result.statusCode == 200){
                    resolve(result);
                }else if(result.error){
                    throw result.error;                       
                }else{
                    throw ERROR.DEFAULT_ERROR;                        
                }                     
            }catch(e){
                reject(e);
            }   
        });
    },

    payloadHandler: function(params, handlerType) {
        if(handlerType === config.communicationType.WHATSAPP_BOTIFY)
            return module.exports.whatsappBotifyPayloadHandler(params);
    },

    whatsappBotifyPayloadHandler: function(params) {
        if(config.whatsappBotify.templatesToSendFromAgentHandle.includes(params.event_name)) {
            const additonalParams = {
                "from" : "pos_main"
            };
            params = {...params,...additonalParams};
        }
        return params;
    }
}
