require('../agendsetup/');
var CampaignService             = require('../../campaign/services/CampaignService');
var CommunicationService = require('../../campaign/services/CommunicationService');
const PollingService = require('../../campaign/services/PollingService');
const ScheduleRewardService = require('../../campaign/services/ScheduleRewardService');
const ScheduleApiService = require('../../campaign/services/ScheduleApiService');

agenda.define('scheduleCampaign', async job => {
    const { name } = job.attrs;
    console.log(`started ${name} 👋`);
    CampaignService.schedule('communication');
});

agenda.define('scheduleCommunication', async job => {
    const { name } = job.attrs;
    console.log(`started ${name} 👋`);
    PollingService.pollAndScheduleData('communication');
});

agenda.define('sendCommunication', async job => {
    const { name } = job.attrs;
    console.log(`started ${name} 👋`);
    CommunicationService.sendCommunication();
});

agenda.define('scheduleCampaignRewards', async job => {
    const { name } = job.attrs;
    console.log(`started ${name} 👋`);
    CampaignService.schedule('reward');
});

agenda.define('pollAndScheduleRewards', async job => {
    const { name } = job.attrs;
    console.log(`started ${name} 👋`);
    PollingService.pollAndScheduleData('reward');
});

agenda.define('processRewards', async job => {
    const { name } = job.attrs;
    console.log(`started ${name} 👋`);
    ScheduleRewardService.assignPointsAndGenerateUniqueId();
});

agenda.define('assignRewardsInPMS', async job => {
    const { name } = job.attrs;
    console.log(`started ${name} 👋`);
    ScheduleRewardService.assignPointsInPms();
});

// scheduled api calls
agenda.define('scheduleApiCampaign', async job => {
    const { name } = job.attrs;
    console.log(`started ${name} 👋`);
    CampaignService.schedule(CONSTANTS.CAMPAIGN_TYPE.API);
});

agenda.define('pollAndScheduleApiCampaigns', async job => {
    const { name } = job.attrs;
    console.log(`started ${name} 👋`);
    PollingService.pollAndScheduleData(CONSTANTS.CAMPAIGN_TYPE.API);
});

agenda.define('processScheduledApis', async job => {
    const { name } = job.attrs;
    console.log(`started ${name} 👋`);
    ScheduleApiService.executeApis();
});

agenda.on('ready', async () => {
        await agenda.start();
        // every minute
        await agenda.every("* * * * *", [
            "scheduleCampaign",
            "scheduleCampaignRewards",
            "scheduleCommunication",
            "scheduleApiCampaign",
            "pollAndScheduleApiCampaigns",
        ]);
        // every 10 seconds [POS]
        await agenda.every("*/10 * * * * *", [
            "pollAndScheduleRewards",
        ]);
        // every 20 seconds [POS]
        await agenda.every("*/20 * * * * *", [
            "processRewards",
            "assignRewardsInPMS",
        ]);
        // every 3 minutes [Generic]
        await agenda.every("*/3 * * * *", [
            "sendCommunication",
        ]);
        // every 30 seconds [Generic]
        await agenda.every("*/30 * * * * *", [
            "processScheduledApis",
        ]);
 }); 

 agenda.on('error', () => {
     console.log("in error");
 });

async function graceful() {
await agenda.stop();
process.exit(0);
}

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);
