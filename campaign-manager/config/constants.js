const HEALTH_CONSTANTS = require('./healthConstants');

const SCHEDULED_REWARDS = {
    CREATED: 0,
    PROCESSED: 1,
    SUCCESS: 3,
    FAILED: 4,
}

const SCHEDULED_REWARDS_FAILURE = {
    RULE_NOT_FOUND: 'rule_identifier_not_found',
    RULE_EXPRESSION_FAILURE : 'rule_expression_failure',
    UNIQUE_ID_GENERATION: 'unique_id_generation_failure',
    DATABASE_QUERY: 'database_query_failure',
    PMS_ASSIGNMENT: 'pms_assignment_failure',
}

const DATABASE_QUERY_TYPE = {
    FETCH: 'FETCH',
    BATCH_FETCH: 'BATCH_FETCH',
    CREATE: 'CREATE',
    BATCH_CREATE: 'BATCH_CREATE',
    BULK_CREATE: 'BULK_CREATE',
    UPDATE: 'UPDATE',
    BULK_UPDATE: 'BULK_UPDATE',
    BATCH_UPDATE: 'BATCH_UPDATE',
    UPSERT: 'UPSERT'
};

const CAMPAIGN_TYPE = {
    COMMUNICATION: 'communication',
    REWARD: 'reward',
    API: 'api'
};

const PROCESS_TYPE = {
  SCHEDULE: `schedule`,
  PROCESS: `process`,
  EXECUTE: `execute`,
}

const SCHEDULED_API_STATUS = {
  CREATED: 0,
  SUCCESS: 1,
  FAILED: 2,
}

const SCHEDULED_API_BATCH_SIZE = 10;

const allowedCampaigns = new Map();
allowedCampaigns.set('communication', 1);
allowedCampaigns.set('reward', 1);
allowedCampaigns.set('api', 1);

const statusCodes = {
    BAD_REQUEST: 400,
    UNAUTHORISED: 403,
    INTERNAL_SERVER_ERROR: 500,
};

const HANDLERS = {
    ADD_PARTNER_DETAILS_FROM_GCD: "addPartnerDetailsFromGcdCode",
    GROUP_AND_ADD_PARTNER_DETAILS_FROM_GCD : "groupAndAddPartnerDetailsFromGCD",
    GROUP_FOLLOWUPS_AND_ADD_PARTNER_DETAILS_FROM_GCD : "groupFollowupsAndAddPartnerDetailsFromGCD",
    ADD_CITY_AND_MEMBER_DETAILS: "addCityAndMemberDetails",
    API_HANDLER_CHECK_CALL_AND_ADD_PARTNER_DETAILS_FROM_GCD : "apiHandlerCheckAndAddPartnerDetailsFromGCD",
    TRAVEL_GENERIC_HANDLER: "travel_generic_handler",
    MOTOR_KYC_SUCCESS_DROPOFF_HANDLER : "motor_kyc_success_dropoff_handler",
    MOTOR_KYC_FAILED_DROPOFF_HANDLER : "motor_kyc_failed_dropoff_handler",
    MOTOR_KYC_PENDING_DROPOFF_HANDLER : "motor_kyc_pending_dropoff_handler",
    MOTOR_KYC_PENDING_TO_SUCCESS_DROPOFF_HANDLER : "motor_kyc_pending_to_success_dropoff_handler",
    MOTOR_KYC_PENDING_TO_FAILED_DROPOFF_HANDLER : "motor_kyc_pending_to_failed_dropoff_handler",
    HEALTH_KYC_SUCCESS_DROPOFF_HANDLER : "health_kyc_success_dropoff_handler",
    HEALTH_KYC_FAILED_DROPOFF_HANDLER : "health_kyc_failed_dropoff_handler",
    HEALTH_KYC_PENDING_DROPOFF_HANDLER : "health_kyc_pending_dropoff_handler",
    HEALTH_KYC_PENDING_TO_SUCCESS_DROPOFF_HANDLER : "health_kyc_pending_to_success_dropoff_handler",
    HEALTH_KYC_PENDING_TO_FAILED_DROPOFF_HANDLER : "health_kyc_pending_to_failed_dropoff_handler",
    TRAVEL_KYC_SUCCESS_DROPOFF_HANDLER : "travel_kyc_success_dropoff_handler",
    TRAVEL_KYC_FAILED_DROPOFF_HANDLER : "travel_kyc_failed_dropoff_handler",
    TRAVEL_KYC_PENDING_DROPOFF_HANDLER : "travel_kyc_pending_dropoff_handler",
    TRAVEL_KYC_PENDING_TO_SUCCESS_DROPOFF_HANDLER : "travel_kyc_pending_to_success_dropoff_handler",
    TRAVEL_KYC_PENDING_TO_FAILED_DROPOFF_HANDLER : "travel_kyc_pending_to_failed_dropoff_handler"


};

const REQUEST_METHODS = ['PUT', 'POST', 'GET', 'PATCH', 'DELETE'];

const VEHICLE_TYPE_SLUG = {
    '1' : "bike",
    '2' : "car"
}

const ACTIVITY = {
    WHATSAPP_BOTIFY : "WhatsApp Message Sent",
    SMS : "SMS Sent",
    EMAIL : "Mail Sent",
    TYPE : {
        SMS : "SMS",
        WHATSAPP_BOTIFY : "WHATSAPP_BOTIFY",
        EMAIL : "EMAIL"
    }
}

const LEAD_DROP = {
    title : 'Customer Drop Off',
    bucket : 'All',
    svg : 'leadDrop',
    advisor : true,    
    team_lead : true,
    stringLength : 22
}
const PRODUCTS = {
    1 : "car",
    2 : "bike",
    3 : "health",
    4 : "term",
    5 : "investment",
}

const PRODUCT_SLUG_MAP = {
    MOTOR : "motor",
    HEALTH : "health",
    TRAVEL : "travel"

}

module.exports = {
    SCHEDULED_REWARDS,
    SCHEDULED_REWARDS_FAILURE,
    DATABASE_QUERY_TYPE,
    CAMPAIGN_TYPE,
    DEFAULT_CAMPAIGN_TYPE: 'communication',
    ALLOWED_CAMPAIGN_TYPE: allowedCampaigns,
    STATUS_CODES: statusCodes,
    HEALTH_CONSTANTS : HEALTH_CONSTANTS,
    HANDLERS,
    PRODUCTS,
    ACTIVITY,
    LEAD_DROP,
    PROCESS_TYPE,
    SCHEDULED_API_STATUS,
    REQUEST_METHODS,
    VEHICLE_TYPE_SLUG,
    PRODUCT_SLUG_MAP
};