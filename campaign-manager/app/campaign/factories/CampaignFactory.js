const CommunicationCampaign = require('../classes/CommunicationCampaign');
const RewardCampaign = require('../classes/RewardCampaign');
const APICampaign = require('../classes/APICampaign');

class CampaignFactory { 
    getCampaignByType(type) {
        switch(type){
            case CONSTANTS.CAMPAIGN_TYPE.COMMUNICATION:
                return new CommunicationCampaign();
            case CONSTANTS.CAMPAIGN_TYPE.REWARD:
                return new RewardCampaign();
            case CONSTANTS.CAMPAIGN_TYPE.API:
                return new APICampaign();
            default:
                return new CommunicationCampaign();
        }
    }
}

module.exports = new CampaignFactory();