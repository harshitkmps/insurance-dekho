interface ScoreDetailsRes {
  data: ScoreDetailsData;
}

interface ScoreDetailsData {
  status: Number;
  message: String;
  body: ScoreDetailsBody;
}

interface ScoreDetailsBody {
  summary: Array<String>;
  details: RulesDetails[];
}

interface RulesDetails {
  id: String;
  rules: Rule[];
}

interface Rule {
  ruleType: String;
  txnType: String;
  ruleValue: RuleValue;
}

interface RuleValue {
  id: String;
  name: String;
  insurerId: Number;
  commissionAttributes: CommissionAttributes;
}

interface CommissionAttributes {
  commissionableType: String;
  odCommissionableBase: String;
  tpCommissionableBase: String;
  totalOdCommission: String;
  totalTpCommission: String;
}

export {
  ScoreDetailsRes,
  ScoreDetailsData,
  ScoreDetailsBody,
  RulesDetails,
  Rule,
  RuleValue as RuleDetails,
  CommissionAttributes,
};
