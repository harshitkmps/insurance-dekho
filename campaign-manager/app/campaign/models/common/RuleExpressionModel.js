const MySqlDB = require('../../../../config/MySqlDB');
const DatabaseError = require('../../../../app/error/DatabaseError');

class RuleExpressionModel {
  constructor() {}
}

RuleExpressionModel.createOrUpdateRule = async (data) => {
    try {
      const record = {
        identifer: data.identifier,
        expression: data.expression,
      };
      const query = `insert into ${TABLE.RULE_EXPRESSIONS} (identifier, expression) values ('${data.identifier}', '${data.expression}') on DUPLICATE KEY update expression = '${data.expression}'`;
      const sqlDB = new MySqlDB();
      const result = await sqlDB.query(query);
      return record;
    } catch (error) {
      console.error(`error in upserting rule. data ${JSON.stringify(record)} error: ${JSON.stringify(error)}`);
      throw new DatabaseError('Error in upserting rule', CONSTANTS.DATABASE_QUERY_TYPE.UPSERT, error);
    }
}

RuleExpressionModel.fetchByIdentifier = async (identifiers) => {
  try {
    const query = `SELECT * FROM ${TABLE.RULE_EXPRESSIONS} WHERE identifier in (?)`;
    const sqlDB = new MySqlDB();
    const result = await sqlDB.query(query, [identifiers]);
    return result;
  } catch (error) {
    // throw exception
    console.error(`error in fetching rule expression from db, error: ${JSON.stringify(error)}`);
    throw new DatabaseError('Error in fetching rules', CONSTANTS.DATABASE_QUERY_TYPE.BATCH_FETCH, error);
  }
}

module.exports = RuleExpressionModel;