
const _ = require("lodash");
const ErrorLog = require('../../../common/models/ErrorLogModel');
const { response } = require("express");
var DbConnectionHelper = require(HELPER_PATH + 'DbConnectionHelper.js');
const CommonHelper = require('../../../../helpers/CommonHelper');

async function fetchLeadsData(product, leadIds) {
    const query = {
        leadIds: leadIds,
        requester: "campaign_manager"
    };

    const productConfig = {
        [CONSTANTS.PRODUCT_SLUG_MAP.MOTOR]: {
            endpoint: '/api/v1/get-lead-kyc-data',
            requestFunction: CommonHelper.sendPostRequestToMotorLMW
        },
        [CONSTANTS.PRODUCT_SLUG_MAP.HEALTH]: {
            endpoint: '/health/leads/get-lead-kyc-data',
            requestFunction: CommonHelper.sendPostRequestToHealthLMW
        },
        [CONSTANTS.PRODUCT_SLUG_MAP.TRAVEL]: {
            endpoint: '/non-motor-lmw/travel/v1/get-lead-kyc-data',
            requestFunction: CommonHelper.sendPostRequestToTravelLMW
        }
    };

    const config = productConfig[product];
    if (config) {
        return await config.requestFunction(query, config.endpoint);
    } else {
        return '';
    }
}

function formatLeadsData(filteredLeadsData, product, campaignConfig = {}) {
    let formattingConfig;
    let formattedLeadsData;
    switch (product) {
        case CONSTANTS.PRODUCT_SLUG_MAP.MOTOR:
            // Get formatting configuration for MOTOR product
            formattingConfig = config.kycDropoffVariableFormatter[CONSTANTS.PRODUCT_SLUG_MAP.MOTOR];

            // Format each lead's data
            formattedLeadsData = Object.values(filteredLeadsData).map(data => {
                const formattedLeadData = {};

                // Apply formatting based on configuration
                for (const [formattedKey, originalKey] of Object.entries(formattingConfig)) {
                    if(originalKey?.config){
                        formattedLeadData[formattedKey] = originalKey.config[data[originalKey['value']]]
                    }else{
                        formattedLeadData[formattedKey] = data[originalKey] || ''; // If original key doesn't exist, set value to empty string
                    }
                }
                try {
                    campaignConfig = JSON.parse(campaignConfig);                
                    
                    if (data?.isPaymentBeforeProposal == 0) {
                        formattedLeadData.url = `${campaignConfig.base}${campaignConfig.motor['PAP']}`;
                    } else {
                        formattedLeadData.url = `${campaignConfig.base}${campaignConfig.motor['PBP']}`;
                    }

                    formattedLeadData.url = formattedLeadData.url.replace("{vehicleType}", formattedLeadData.vehicle_type);
                    formattedLeadData.url = formattedLeadData.url.replace("{leadId}", data.leadId);
                } catch (error) {
                    console.error("Unable to parse campaign config: ", error);
                }
                return formattedLeadData;
            });

            return formattedLeadsData;

        case CONSTANTS.PRODUCT_SLUG_MAP.HEALTH:
            // Get formatting configuration for MOTOR product
            formattingConfig = config.kycDropoffVariableFormatter[CONSTANTS.PRODUCT_SLUG_MAP.HEALTH];

            // Format each lead's data
            formattedLeadsData = Object.values(filteredLeadsData).map(data => {
                const formattedLeadData = {};

                // Apply formatting based on configuration
            for (const [formattedKey, originalKey] of Object.entries(formattingConfig)) {
                formattedLeadData[formattedKey] = data[originalKey] || ''; // If original key doesn't exist, set value to empty string
            }
            
            try {
                campaignConfig = JSON.parse(campaignConfig);
                formattedLeadData.url = `${campaignConfig.base}${campaignConfig.health}`;
                formattedLeadData.url = formattedLeadData.url.replace("{leadId}",data.leadId);
            } catch (error) {
                console.error("Unable to parse campaign config: ", error);
            }

            return formattedLeadData;
            });

            return formattedLeadsData;
        case CONSTANTS.PRODUCT_SLUG_MAP.TRAVEL:
            // Get formatting configuration for MOTOR product
            formattingConfig = config.kycDropoffVariableFormatter[CONSTANTS.PRODUCT_SLUG_MAP.TRAVEL];

            // Format each lead's data
            formattedLeadsData = Object.values(filteredLeadsData).map(data => {
                const formattedLeadData = {};

                // Apply formatting based on configuration
                for (const [formattedKey, originalKey] of Object.entries(formattingConfig)) {
                    formattedLeadData[formattedKey] = data[originalKey] || ''; // If original key doesn't exist, set value to empty string
                }

                try {
                    campaignConfig = JSON.parse(campaignConfig);
                    formattedLeadData.url = `${campaignConfig.base}${campaignConfig.travel}`;
                    formattedLeadData.url = formattedLeadData.url.replace("{leadId}",data.leadId);
                } catch (error) {
                    console.error("Unable to parse campaign config: ", error);
                }
                return formattedLeadData;
    
            });
            return formattedLeadsData;
                
        default:
            return [];
    }
}

async function fetchOfflineLeads(product, leadIds) {
    const leadIdsString = leadIds.map(id => `'${id}'`).join(',');
    const productConfig = {
        [CONSTANTS.PRODUCT_SLUG_MAP.MOTOR]: {
            db_type: 'mysql',
            data_source: 'motor_lms',
            query: `SELECT b2c_lead_id as visit_id FROM insurance_leads WHERE last_online_datetime < DATE_SUB(NOW(), INTERVAL 1 MINUTE) AND b2c_lead_id IN (${leadIdsString}) AND opted_whatsapp = 1`
        },
        [CONSTANTS.PRODUCT_SLUG_MAP.HEALTH]: {
            db_type: 'mysql',
            data_source: 'health',
            query: `SELECT ld.visit_id FROM gibpl_leads l JOIN gibpl_lead_details ld ON ld.lead_id = l.lead_id WHERE l.last_online_date_time < DATE_SUB(NOW(), INTERVAL 1 MINUTE) AND ld.visit_id IN (${leadIdsString}) AND l.opted_whatsapp = 1`
        }
    };

    const config = productConfig[product];

    if (config) {
        return await DbConnectionHelper.executeQuery(config.query, config.db_type, config.data_source);
    } else {
        return [];
    }
}



exports.transformKYCData = async function (records, product, kycStatus, config = {}) {
    try {

        if (records && records.length > 0) {
            let leadIds = records.map(record => 
                (record.b2c_lead_id ? String(record.b2c_lead_id) : String(record.visit_id))
              );

              if(leadIds && ['pending_to_success', 'pending_to_failed'].includes(kycStatus)){
                const offlineLeadIds = await fetchOfflineLeads(product, leadIds);
                leadIds = offlineLeadIds.map(row => row.visit_id);
              }

            const leadsData = await fetchLeadsData(product, leadIds);

            const filteredLeadsData = Object.fromEntries(
                Object.entries(leadsData).filter(([leadId, data]) => {
                    const currentTime = new Date();
                    
                    // Check if kycStatus matches
                    if (data?.kycStatus === kycStatus) {
                        // Check if kycCreatedAt is within the last 15 minutes
                        if (data?.kycCreatedAt) {
                            const kycCreatedAtDate = new Date(data.kycCreatedAt);
                            const fifteenMinutesAgo = new Date(currentTime - 15 * 60 * 1000); 

                            if (kycCreatedAtDate >= fifteenMinutesAgo) {
                                return true;
                            }
                        }
                        return false;
                    }
            
                    // If kycStatus is "pending_to_success" or "pending_to_failed", check kycStatusUpdateTime
                    if (['pending_to_success', 'pending_to_failed'].includes(kycStatus)) {
                        // Check if kycStatusUpdateTime exists and is within the last 1 hour
                        if (data.kycStatusUpdateTime) {
                            const lastUnderscoreIndex = kycStatus.lastIndexOf('_');
                            const statusEnding = kycStatus.slice(lastUnderscoreIndex + 1);
            
                            if (data.kycStatus === statusEnding) {
                                return true;
                            }
                        }
                    }
            
                    return false;
                })
            );    

            const formattedLeadsData = formatLeadsData(filteredLeadsData, product, config);

            return formattedLeadsData;            
        }
        return [];
    } catch (ex) {
        ErrorLog.addErrorLog('Error in transformKYCData : ', ex);
        console.log("Error in transformKYCData", ex);
    }
}
