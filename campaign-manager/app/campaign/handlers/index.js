const { addPartnerDetails, groupByPartnerGCD, groupFollowupsByPartnerGCD, checkCallData } = require("./Partner");
const { HANDLERS } = require("../../../config/constants");
const { addCityNameAndMemberDetails } = require("./city")
const { transformTravelLeadData } = require("./travel")
const { transformKYCData } = require("./kyc")
const { updateActivity } = require("./activity");
const { leadDrop } = require("./leadDrop");
exports.handlePolledData = async function (data, handler, config) {
    let result;
    switch (handler) {
        case HANDLERS.ADD_PARTNER_DETAILS_FROM_GCD:
          result = await addPartnerDetails(data);
          console.log('RESULT :::: \n');
          console.log(result);
          return result;
        case HANDLERS.GROUP_AND_ADD_PARTNER_DETAILS_FROM_GCD:
          result = await groupByPartnerGCD(data);
          result = await addPartnerDetails(result);
          return result;
        case HANDLERS.ADD_CITY_AND_MEMBER_DETAILS:
          result = await addCityNameAndMemberDetails(data);
          return result;
        case HANDLERS.GROUP_FOLLOWUPS_AND_ADD_PARTNER_DETAILS_FROM_GCD:
          result = await groupFollowupsByPartnerGCD(data);
          result = await addPartnerDetails(result);
          return result;
        case HANDLERS.API_HANDLER_CHECK_CALL_AND_ADD_PARTNER_DETAILS_FROM_GCD:
          result = await checkCallData(data);
          result = await addPartnerDetails(result);
          return result;
        case HANDLERS.TRAVEL_GENERIC_HANDLER:
          result = await transformTravelLeadData(data, config);
          return result;
        case HANDLERS.MOTOR_KYC_SUCCESS_DROPOFF_HANDLER:
          result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.MOTOR, 'success', config);
          return result;
        case HANDLERS.MOTOR_KYC_FAILED_DROPOFF_HANDLER:
          result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.MOTOR, 'failed', config);
          return result;
        case HANDLERS.MOTOR_KYC_PENDING_DROPOFF_HANDLER:
          result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.MOTOR, 'pending', config);
          return result;
        case HANDLERS.MOTOR_KYC_PENDING_TO_SUCCESS_DROPOFF_HANDLER:
          result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.MOTOR, 'pending_to_success', config);
          return result;
        case HANDLERS.MOTOR_KYC_PENDING_TO_FAILED_DROPOFF_HANDLER:
          result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.MOTOR, 'pending_to_failed', config);
          return result;
        case HANDLERS.HEALTH_KYC_SUCCESS_DROPOFF_HANDLER:
          result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.HEALTH, 'success', config);
          return result;
        case HANDLERS.HEALTH_KYC_FAILED_DROPOFF_HANDLER:
          result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.HEALTH, 'failed', config);
          return result;
        case HANDLERS.HEALTH_KYC_PENDING_DROPOFF_HANDLER:
          result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.HEALTH, 'pending', config);
          return result;
        case HANDLERS.HEALTH_KYC_PENDING_TO_SUCCESS_DROPOFF_HANDLER:
          result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.HEALTH, 'pending_to_success', config);
          return result;
        case HANDLERS.HEALTH_KYC_PENDING_TO_FAILED_DROPOFF_HANDLER:
          result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.HEALTH, 'pending_to_failed', config);
          return result;
        // case HANDLERS.TRAVEL_KYC_SUCCESS_DROPOFF_HANDLER:
        //   console.log("---------TRAVEL_KYC_SUCCESS_DROPOFF_HANDLER-------------");
        //   result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.TRAVEL, 'success', config);
        //   return result;
        // case HANDLERS.TRAVEL_KYC_FAILED_DROPOFF_HANDLER:
        //   console.log("---------TRAVEL_KYC_FAILED_DROPOFF_HANDLER-------------");
        //   result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.TRAVEL, 'failed', config);
        //   return result;
        // case HANDLERS.TRAVEL_KYC_PENDING_DROPOFF_HANDLER:
        //   console.log("---------TRAVEL_KYC_PENDING_DROPOFF_HANDLER-------------");
        //   result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.TRAVEL, 'pending', config);
        //   return result;
        // case HANDLERS.TRAVEL_KYC_PENDING_TO_SUCCESS_DROPOFF_HANDLER:
        //   console.log("---------TRAVEL_KYC_PENDING_TO_SUCCESS_DROPOFF_HANDLER-------------");
        //   result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.TRAVEL, 'pending_to_success', config);
        // case HANDLERS.TRAVEL_KYC_PENDING_TO_FAILED_DROPOFF_HANDLER:
        //   console.log("---------TRAVEL_KYC_PENDING_TO_FAILED_DROPOFF_HANDLER-------------");
        //   result = await transformKYCData(data, CONSTANTS.PRODUCT_SLUG_MAP.TRAVEL, 'pending_to_failed', config);
        //   return result;
        case HANDLERS.UPDATE_ACTIVITY:
          result = await updateActivity(data, campaignData);
          return data;
        case HANDLERS.LEAD_DROP:
          result = await leadDrop(data, campaignData);
          return result;
        default:
          throw new Error(`Invalid Handler ${handler}`);
      }
      
}
