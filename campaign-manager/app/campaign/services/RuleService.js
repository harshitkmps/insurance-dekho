const jexl = require('jexl');
const ScheduleRewardProcessingError = require('../../error/ScheduleRewardProcessingError');


const calculate = async (rule, context) => {
    try {
        const expressionValue = await jexl.eval(rule, context);
        if (isNaN(expressionValue)) {
            throw new ScheduleRewardProcessingError(
                'Error in evaluating rule expression',
                CONSTANTS.SCHEDULED_REWARDS_FAILURE.RULE_EXPRESSION_FAILURE
            );
        }
        return expressionValue;
    } catch (error) {
        throw new ScheduleRewardProcessingError(
            'Error in evaluating rule expression',
            CONSTANTS.SCHEDULED_REWARDS_FAILURE.RULE_EXPRESSION_FAILURE
        );
    }
}

module.exports = {
    calculate,
};