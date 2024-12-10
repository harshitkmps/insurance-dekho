const ApiController = require('../../common/controllers/ApiController');
const RuleExpressionModel = require('../models/common/RuleExpressionModel');

class RuleExpressionController extends ApiController {
  constructor() {
    super();
  }
}

RuleExpressionController.upsertRuleExpression = async function (req, res) {
  const { rules } = req.body;
  let errors = [];
  _.each(rules, (rule) => {
    if (!rule.identifier) {
      const error = this.formatError('ERR10023', 'identifier');
      errors.push(error);
    }
    if (!rule.expression) {
      const error = this.formatError('ERR10024', 'expression');
      errors.push(error);
    }
  });
  if (errors.length > 0) {
    return this.sendResponse(req, res, 400, false, false, e);
  }
  let results = [];
  for (rule of rules) {
    let result = {};
    try {
      result = await RuleExpressionModel.createOrUpdateRule(rule);
    } catch (error) {
      result = {
        error: JSON.stringify(error),
        status: 'failed',
        record: rule
      };
    }
    results.push(result);
  }
  this.sendResponse(req, res, 200, false, { data: results }, false);
};

module.exports = RuleExpressionController;