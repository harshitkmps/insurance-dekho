const _ = require("lodash");
const moment = require("moment");
const DbConnectionHelper = require(HELPER_PATH + 'DbConnectionHelper.js');
const ErrorLog = require('../../../common/models/ErrorLogModel');
/**
 * This method will extract the gcd_code from the record and get its equivalent phone number, agent first and last name.
 * Then, it will return the updated records with the agent data we fetched.
 */

exports.addPartnerDetails = async function (records) {
    try {
        const promises = records.map(r => {
            const query = `SELECT first_name as agent_first_name, last_name as agent_last_name, mobile as mobile_number, dealer_id as user_id FROM tbl_user WHERE gcd_code = '${r.agent_gcd}' LIMIT 1`;
            return DbConnectionHelper.executeQuery(query, "mysql", "pos").then(result => ({ record: r, result }));;
        });
        const resultsWithRecords = await Promise.all(promises);
        const mappedRecords = resultsWithRecords.map(({ record, result }) => ({
            ...record,
            visit_time: moment(record.scheduled_datetime).format("LT"),
            visit_date: moment(record.scheduled_datetime).format("Do MMM YY"),
            ...result[0], // Assuming the query returns an array with a single result
        }));
        return mappedRecords;
    } catch (ex) {
        ErrorLog.addErrorLog('Error in addPartnerDetails : ', ex);
        console.log("Error in addPartnerDetails", ex);
        throw ex;
    }
}

/**
 * Calculate partner today's no. of meeting.
 * 
 * @async
 * @param   {Iterable} records  - Row-wise data from query.
 * @returns {Iterable} result   - Computed records will be returned.
 * @throws  {String}   err      - Error, if any
 */

exports.groupByPartnerGCD = async function (records) {
    try {
        const agentWiseData = _.groupBy(records,"agent_gcd");
        const result = [];
        _.each(agentWiseData, (val, key) => {
            result.push({
                agent_gcd           : key,
                meeting_list        : val,
                reference_id        : key,
                no_of_meeting       : val.length,
                scheduled_datetime  : val[0].scheduled_datetime
            }); 
        });
        return result;
    } catch (err) {
        ErrorLog.addErrorLog('Error in groupByPartnerGCD : ', err);
        console.error(err);
        throw err;
    }
}

exports.groupFollowupsByPartnerGCD = async function (records) {
    try {
        const agentWiseData = _.groupBy(records,"agent_gcd");
        const result = [];
        _.each(agentWiseData, (val, key) => {
            result.push({
                agent_gcd           : key,
                followup_list       : val,
                reference_id        : key,
                no_of_followups     : val.length
            }); 
        });
        return result;
    } catch (err) {
        ErrorLog.addErrorLog('Error in groupFollowupsByPartnerGCD : ', err);
        console.error(err);
        throw err;
    }
}

exports.checkCallData = async function (records) {
    try {
        const promises = records.map(r => {
            const query = `SELECT gccd.lead_id, gccd.call_start_time FROM gibpl_c2c_call_details gccd WHERE gccd.lead_id = ${r.lead_id} AND gccd.caller_identifier = "${r.agent_gcd}" AND gccd.caller_status = 1 AND gccd.callee_status = 1 AND gccd.call_start_time < (UNIX_TIMESTAMP() + (5 * 3600 + 30 * 60)) AND gccd.call_start_time >= (UNIX_TIMESTAMP() + (5 * 3600 + 30 * 60) - 3600) LIMIT 1;`;
            return DbConnectionHelper.executeQuery(query, "mysql", "fusion").then(result => ({ record: r, result }));;
        });
        const resultsWithRecords = await Promise.all(promises);

        const filteredRecords = resultsWithRecords.filter(({ result }) => result.length === 0);
        const mappedRecords = filteredRecords.map(({ record, result }) => ({
            ...record,
            visit_time: moment(record.scheduled_datetime).format("LT"),
            visit_date: moment(record.scheduled_datetime).format("Do MMM YY"),
        }));
        return mappedRecords;
    } catch (err) {
        ErrorLog.addErrorLog('Error in checkCallData : ', err);
        console.error(err);
        throw err;
    }
}