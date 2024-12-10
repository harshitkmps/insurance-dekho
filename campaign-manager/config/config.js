var path    = require('path');
const CONSTANTS = require('./constants');

var config  = {};

config.sessionSecretKey = 'c@rDekh0';

config.message = {};
config.message.portMsg  = 'listening on *:';

config.mailer = {};
config.mailer.username  = 'ucchatbot@gaadi.com';
config.mailer.password  = 'HH1012utybyu';

config.report = {};
config.report.from      = 'ucchatbot@gaadi.com';
config.report.to        = 'anand.gupta@girnarsoft.com';

config.report.timeoutError      = true;
config.report.timeoutErrorTo    = ['anand.gupta@girnarsoft.com', 'sanjay.singh@girnarsoft.com'];
config.report.timeoutErrorTemplateName = 'B2C_API_TIMEOUT_ERROR_INS';

config.report.byPassLogError      = false;
config.report.byPassLogErrorTo    = ['anand.gupta@girnarsoft.com', 'sanjay.singh@girnarsoft.com'];
config.report.byPassLogErrorTemplateName = 'B2C_API_BYPASS_LOG_ERROR_INS';

config.format = {};
config.format.json      = 'JSON';
config.format.xml       = 'XML';

config.status = {};
config.status.pending   = 1;
config.status.autoMapped= 2;
config.status.approved  = 3;



config.source = {};
config.source.autodb        = 'autodb';
config.source.parivahan     = 'parivahan';
config.source.vahan         = 'vahan';
config.source.rtoVehicle    = 'rtoVehicle';
config.source.leadCampaing  = 'leadCampaing';
config.source.leadCampaingPrime  = 'leadCampaingPrime';
config.source.zoopBasic     = 'zoopBasic';
config.source.zoopAdvance   = 'zoopAdvance';

config.subSource = {};
config.subSource.vahanScrapper = 'vahanScrapper';

config.dataSource = {};
config.dataSource.autodb    = 'AutoDB';
config.dataSource.itms      = 'ITMS';
config.dataSource.rtoApi    = 'RtoApi';

config.aws      = {};
config.aws.s3   = {};
config.aws.s3.enabled   = true;
config.aws.s3.bucketName= 'girnarsoft-autodb'; 

config.requests = [
    {
        path:'*', 
        timeout:90000
    }
];

config.apiLog   = true;
config.elkLog   = false;
config.accessLog= true;
config.byPassLog = [
                    '/',
                    '/user/login',
                    '/user/create',
                    '/user/signup',
                    '/validation/username',
                    '/user',
                    '/update-user',
                    '/user/logout',               
            ];

config.hideDetailInErrorResponse    = false;
config.showDefaultErrorMessage      = false;

//paginatiom
config.pagination = {};
config.pagination.limit = 20;


config.nameTitle = ['Mrs', 'Mr', 'Ms', 'Miss', 'Prof', 'Dr', 'Er'];
config.redisKeyExpiryTime = '23:59:59:999';
config.recordPerPage = 20;
config.corsAllowedOrigin = [/localhost:3000$/, /\.gaadi\.com$/, /\.insurancedekho\.com$/];
config.dbType = {"mysql": "mysql", "mongo": "mongodb", "mongodb": "mongodb"};
config.communicationType = {"SMS": "SMS", "EMAIL": "EMAIL", "WHATSAPP": "WHATSAPP", "WHATSAPP_BOTIFY" : "WHATSAPP_BOTIFY"};
config.communicationEnable = {"SMS": true, "EMAIL": true, "WHATSAPP": true, "WHATSAPP_BOTIFY": true};
config.whatsappBotify = {};
config.whatsappBotify.channel_type = "WA_INFOBIP";
config.whatsappBotify.company_handle = 917551196989;
config.scheduleCampaignStatus = {"NEW": "NEW", "IN_PROGRESS": "IN_PROGRESS", "PARTIAL_COMPLETED": "PARTIAL_COMPLETED", "COMPLETED": "COMPLETED", "FAILED":"FAILED"};
config.queryLimit = 100;
config.externalQueryLimit = 1000;
config.whatsappBotify.templatesToSendFromAgentHandle = ['fus_meetlist_tomorrow','fus_meetlist_today', 'fus_partdrop_meetnoaction', 'fus_partdrop_meetnotreached', 'fus_partdrop_meetnotstarted', 'fus_partdrop_delaymeetnoaction', 'fus_partdrop_delaymeetnotreached', 'fus_partdrop_delaymeetnotstarted', 'fus_partdrop_meetstartednotended', 'fus_partdrop_meetdonepaymentnot', 'fus_meetremind_agent', 'fus_followup_remind_agent', 'healthless_policy', 'policynot_sold', 'healthmore_policy', 'healthmultiple_pos', 'posparticular_health', 'poshealth_kyc','policycompleted','complete_policy','training_session', 'fusion_followuplist_tomorrow', 'fusion_followuplist_today'];

config.kycDropoffVariableFormatter = {};
config.kycDropoffVariableFormatter.motor = {
    Insurer_name : "insurerShortName",
    vehicle_type :  {config: CONSTANTS.VEHICLE_TYPE_SLUG , value: "vehicleCategory"},
    Premium : "totalPremium",
    reg_no : "registrationNumber",
    mobile_number: "mobileNumber"
}

config.kycDropoffVariableFormatter.health = {
    Insurer_name : "insurerShortName",
    Premium : "premium",
    mobile_number: "mobileNumber",
    customer_name : "firstName",
    plan_name : "planName",
    mobile_number: "mobileNumber"
}

config.kycDropoffVariableFormatter.travel = {
    Insurer_name : "insurerShortName",
    Premium : "premium",
    mobile_number: "mobile",
    country : "country",
}

global.BASE_DIR         = path.join(__dirname,'../');
global.UPLOAD_DIR       = 'uploads';
global.CONFIG_PATH      = BASE_DIR+'/config/';
global.HELPER_PATH      = BASE_DIR+'/helpers/';
global.UPLOAD_PATH      = BASE_DIR+'/'+UPLOAD_DIR+'/'
global.LOG_PATH         = BASE_DIR+'/logs/';
global.NODE_MODULE_PATH = BASE_DIR+'/node_modules/';
global.ELK_FILE_PATH    = BASE_DIR+'/logs/vahan_scrapper.json';

module.exports = config;
