const ScheduleRewardsModel = require('../models/reward/ScheduleRewardsModel');
const RuleExpressionModel = require('../models/common/RuleExpressionModel');
const RuleService = require('../services/RuleService');
const ScheduleRewardProcessingError = require('../../error/ScheduleRewardProcessingError');
const DatabaseError = require('../../error/DatabaseError');
const CommonHelper = require(HELPER_PATH + 'CommonHelper.js');
const PmsHelper = require(HELPER_PATH + 'PmsHelper.js');
const moment = require('moment');

class ScheduleRewardService {
  constructor() { }
}

const getCurrentFinancialYearEnd = () => {
  if (moment().quarter() >= 2) {
    var thisFiscalEnd = moment().add(1, 'year').month('March').endOf('month').format('YYYY-MM-DD HH:mm:ss')
  } else {
    var thisFiscalEnd = moment().month('March').endOf('month').format('YYYY-MM-DD HH:mm:ss')
  };
  return thisFiscalEnd;
};

const generateUniqueId = (pattern, metadata) => {
  try {
    let uniqueId = pattern;
    if (!CommonHelper.isEmpty(metadata)) {
      for (let key in metadata) {
        uniqueId = uniqueId.replace('${' + key + '}', metadata[key]);
      }
    }
    return uniqueId;
  } catch (error) {
    throw new ScheduleRewardProcessingError(
      'Error in generating unique id',
      CONSTANTS.SCHEDULED_REWARDS_FAILURE.UNIQUE_ID_GENERATION
    );
  }
};

const preparePayloadForPMSBulk = (scheduleRewards) => {
  const payload = _.map(scheduleRewards, (scheduleReward) => {
    const object = {
      record_id: scheduleReward.id,
      tenant: scheduleReward.tenant,
      user_id: scheduleReward.user_id,
      user_type: scheduleReward.user_id_type,
      campaign_id: scheduleReward.campaign_id.toString(),
      unique_id: scheduleReward.unique_id,
      value: scheduleReward.points,
      allocation_date: scheduleReward.allocation_date,
      expiration_date: getCurrentFinancialYearEnd(),
      type: scheduleReward.points_type,
      meta_data: JSON.parse(scheduleReward.meta_data),
    }
    return object;
  });
  return payload;
};

const processEachReward = async (scheduledRewardsItem, rules) => {
  try {
    // calculate points
    const rule = _.find(rules, {
      identifier: scheduledRewardsItem.rule_identifier,
    });
    if (CommonHelper.isEmpty(rule)) {
      throw new ScheduleRewardProcessingError(
        'Rule identifier not found',
        CONSTANTS.SCHEDULED_REWARDS_FAILURE.RULE_NOT_FOUND
      );
    }
    const points = await RuleService.calculate(
      rule.expression,
      JSON.parse(scheduledRewardsItem.meta_data),
    );
    // generate unique id
    const uniqueId = generateUniqueId(
      scheduledRewardsItem.unique_id_format,
      JSON.parse(scheduledRewardsItem.meta_data),
    );
    const updateData = {
      id: scheduledRewardsItem.id,
      points,
      unique_id: uniqueId,
      status: CONSTANTS.SCHEDULED_REWARDS.PROCESSED,
    };
    // update item
    await ScheduleRewardsModel.update(updateData);
    return;
  } catch (error) {
    // decide the type on exceptions
    const updateData = {
      id: scheduledRewardsItem.id,
      status: CONSTANTS.SCHEDULED_REWARDS.FAILED,
    };
    if (error instanceof ScheduleRewardProcessingError) {
      updateData.failure_type = error.type;
    }
    if (error instanceof DatabaseError) {
      updateData.failure_type =
        CONSTANTS.SCHEDULED_REWARDS_FAILURE.DATABASE_QUERY;
    }
    await ScheduleRewardsModel.update(updateData);
    return;
  }
}

ScheduleRewardService.assignPointsAndGenerateUniqueId = async () => {
  // fetch records from schedule rewards
  const scheduledRewards = await ScheduleRewardsModel.getByStatus(CONSTANTS.SCHEDULED_REWARDS.CREATED);
  if (scheduledRewards.length == 0) {
    return;
  }
  // filter out unique rule_identifiers
  const uniqueRuleIdentifiers = _.uniq(_.map(scheduledRewards, 'rule_identifier'));
  // fetch rules from db for identifiers
  const rules = await RuleExpressionModel.fetchByIdentifier(uniqueRuleIdentifiers);
  // for each scheduled_rewards
  const promises = _.map(scheduledRewards, (scheduledRewardsItem) => {
    return processEachReward(scheduledRewardsItem, rules);
  });
  await Promise.all(promises);
};

ScheduleRewardService.assignPointsInPms = async () => {
  const batchSize = 50;
  const scheduledRewards = await ScheduleRewardsModel.getByStatus(CONSTANTS.SCHEDULED_REWARDS.PROCESSED);

  for (let i = 0; i < scheduledRewards.length; i += batchSize) {
    const batch = scheduledRewards.slice(i, i + batchSize);
  
    if(!batch.length) {
      continue;
    }
  
  const payload = preparePayloadForPMSBulk(batch);
  const responseBody = await PmsHelper.createPointsBulk(payload);

  const promises = batch.map(async (scheduleReward) => {
    const responseObject = _.find(responseBody, { record_id: scheduleReward.id });
    let updateScheduleRewardData = {
      id: scheduleReward.id,
      sent_at: moment().format('YYYY-MM-DD hh:mm:ss'),
    };
    if (!responseObject || !responseObject.success) {
      updateScheduleRewardData.status = CONSTANTS.SCHEDULED_REWARDS.FAILED;
      updateScheduleRewardData.failure_type = CONSTANTS.SCHEDULED_REWARDS_FAILURE.PMS_ASSIGNMENT;
    } else {
      updateScheduleRewardData.status = CONSTANTS.SCHEDULED_REWARDS.SUCCESS;
    }
    return ScheduleRewardsModel.update(updateScheduleRewardData);
  });
  // bulk update the records
  await Promise.all(promises);
}
};

module.exports = ScheduleRewardService;

