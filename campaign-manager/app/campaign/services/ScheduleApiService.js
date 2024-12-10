const ScheduleApiModel = require('../models/api/ScheduleApisModel');
const CommonHelper = require('../../../helpers/CommonHelper');
const moment = require('moment');

class ScheduleApiService {
  constructor() { }
}

ScheduleApiService.executeApis = async () => {
    try {
        // Fetch scheduled APIs where status = CREATED
        const scheduledApis = await ScheduleApiModel.getByStatus(CONSTANTS.SCHEDULED_API_STATUS.CREATED);

        if (!scheduledApis.length) {
            return;
        }

        // Trigger the scheduled APIs and prepare bulk update data
        const promises = scheduledApis.map(async (scheduledApi) => {
            let updateScheduleApiData = {
                id: scheduledApi.id,
                sent_at: moment().format('YYYY-MM-DD hh:mm:ss'),
            };
            try {

                // Prepare headers for the API request from config
                const parsedConfig = JSON.parse(scheduledApi.campaign_api_config);
                console.log(parsedConfig.headers);
                scheduledApi.headers = CommonHelper.replaceVariables(parsedConfig.headers, config);

                const apiResponse = await CommonHelper.prepareAndSendRequest(scheduledApi);

                if (apiResponse) {
                    updateScheduleApiData.status = CONSTANTS.SCHEDULED_API_STATUS.SUCCESS;
                } else {
                    updateScheduleApiData.status = CONSTANTS.SCHEDULED_API_STATUS.FAILED;
                }

                await ScheduleApiModel.update(updateScheduleApiData);

            } catch (error) {

                console.error(`Error processing scheduled API: ${error.message}`);
                updateScheduleApiData.status = CONSTANTS.SCHEDULED_API_STATUS.FAILED;
                await ScheduleApiModel.update(updateScheduleApiData);
            }
        });

        // Perform API triggering with parallel processing in batches of size 10
        await CommonHelper.processInBatches(promises, CONSTANTS.SCHEDULED_API_BATCH_SIZE);

    } catch (error) {
        console.error(`Error executing scheduled APIs: ${error}`);
        return false;
    }
};  

module.exports = ScheduleApiService;

