
const _ = require("lodash");
const ErrorLog = require('../../../common/models/ErrorLogModel');
var CommonHelper = require(HELPER_PATH + 'CommonHelper.js');
exports.transformTravelLeadData = async function (records, campaignConfig) {
    try {
        const prepareBuyLink = async (data) => {
            let buy_link = "";
            try {
                campaignConfig = JSON.parse(campaignConfig);
            } catch (error) {
                console.error("Unable to parse campaign config: ", error);
            }
            try {
                buy_link = campaignConfig.base;
                if(data && data.status  && campaignConfig[data.status] && campaignConfig[data.status][data.subStatus]) {
                    buy_link += campaignConfig[data.status][data.subStatus];
                    buy_link = buy_link.replace("request_id",data.leadId);
                };
                console.log(`Travel Buy_Link for  - ${data.leadId} - ${buy_link}`);
                const shorten_url = await CommonHelper.getShortenUrlFromITMS(buy_link);
    
                if( shorten_url.hasOwnProperty("url") && !CommonHelper.isEmpty(shorten_url.url)){
                    buy_link = shorten_url.url;
                }
            } catch (error) {
                console.error("unable to transform campaign", error);
            }
            return buy_link;
        }

        const transformedData = Promise.all(records.map(async (r) => {
            r.buy_link = await prepareBuyLink(r);
            if(r.buy_link) {
                const buyLinkSplit = r.buy_link.split('https://insdekho.com/');
                if(buyLinkSplit && buyLinkSplit.length > 1) {
                    r.url_request_id = buyLinkSplit[1];
                }
            }
            return r;
        }));
        return transformedData;

    } catch (ex) {
        ErrorLog.addErrorLog('Error in transformTravelLeadData : ', ex);
        console.log("Error in transformTravelLeadData", ex);
    }
}
