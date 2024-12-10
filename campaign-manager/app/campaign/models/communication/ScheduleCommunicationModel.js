const {resolve} = require('path');
var CommonHelper = require(HELPER_PATH + 'CommonHelper.js');
var FunctionHelper = require(HELPER_PATH + 'FunctionHelper.js');
var MySqlDB = require('../../../../config/MySqlDB');
var moment = require('moment');

class ScheduleCommunicationModel {
    constructor() {

    }
}

ScheduleCommunicationModel.checkRecordExists = function (campaignId, communicationType, mobile = false, email = false) {
    return new Promise(async function (resolve, reject) {
        try {
            if (campaignId && communicationType) {
                var sqlDB = new MySqlDB();
                let query = 'select count(id) as count from ' + TABLE.SCHEDULED_COMMUNICATIONS + ' where is_sent=0 and status=1 and campaign_id = ' + campaignId + ' and communication_type = "' + communicationType + '"';
                if (mobile) {
                    query += ' and mobile_number = "' + mobile + '"';
                }
                if (email) {
                    query += ' and email = "' + email + '"';
                }
//                console.log(query);
                let chkCommSchdule = await sqlDB.query(query);

                if (chkCommSchdule) {
                    resolve(chkCommSchdule)
                }
            } else {
                reject(new Error('Campaign id and Campaign type required'));
            }
        } catch (e) {
            reject(e);
        }
    });
}

ScheduleCommunicationModel.checkRecordExistWithoutDuplicate = function (campaignId, communicationType, reference_id) {
    return new Promise(async function (resolve, reject) {
        try {
            if (campaignId && communicationType && reference_id) {
                var sqlDB = new MySqlDB();
                let query = 'select count(id) as count from ' + TABLE.SCHEDULED_COMMUNICATIONS + ' where is_sent=0 and status=1 and campaign_id = ' + campaignId + ' and communication_type = "' + communicationType + '" and reference_id = "' + reference_id + '"';
                //console.log("DUPLICATE QUERY CHECK : \n",query);
                let chkCommSchdule = await sqlDB.query(query);

                if (chkCommSchdule) {
                    resolve(chkCommSchdule)
                }
            } else {
                reject(new Error('Campaign id, Campaign type and Referece Id required'));
            }
        } catch (e) {
            reject(e);
        }
    });
}

ScheduleCommunicationModel.addScheduleCommunication = function (data) {
    return new Promise(async function (resolve, reject) {
        let schCommunication = {};

        schCommunication.campaign_id = data.campaign_id ? data.campaign_id : '';
        schCommunication.communication_type = data.communication_type ? data.communication_type.trim() : '';
        schCommunication.template_name = data.template_name ? data.template_name.trim() : '';
        schCommunication.template_variable = data.template_variable ? data.template_variable : null;
        schCommunication.recipient_name = data.recipient_name ? data.recipient_name : '';
        schCommunication.mobile_number = data.mobile_number ? data.mobile_number : null;
        schCommunication.email = data.email ? data.email : null;
        schCommunication.reference_id = data.reference_id ? data.reference_id : '';
        schCommunication.reference_timestamp = data.reference_timestamp ? data.reference_timestamp : moment().format('YYYY-MM-DD HH:mm:ss');
        schCommunication.data_source = data.data_source ? data.data_source : '';
        schCommunication.product_category = data.product_category ? data.product_category : '';
        schCommunication.product_sub_category = data.product_sub_category ? data.product_sub_category : null;
        schCommunication.scheduled_at = data.scheduled_at ? data.scheduled_at : '';

        try {
            var sqlDB = new MySqlDB();
            let query = 'INSERT INTO ' + TABLE.SCHEDULED_COMMUNICATIONS + ' SET ?';
            let result = await sqlDB.query(query, schCommunication);
            if (result) {
                resolve(result.insertId)
            } else {
                throw ERROR.DEFAULT_ERROR;
            }
        } catch (e) {
            reject(e);
        }
    });
};

ScheduleCommunicationModel.getRecords = function (limit = 200) {
    return new Promise(async function (resolve, reject) {
        try {
            var sqlDB = new MySqlDB();
            let query = 'SELECT * from ' + TABLE.SCHEDULED_COMMUNICATIONS + ' where is_sent = 0 and status = 1 and scheduled_at <= now() ORDER BY scheduled_at ASC LIMIT ' + limit;
            let data = await sqlDB.query(query);
            if (data) {
                resolve(data)
            }
        } catch (e) {
            reject(e);
        }
    });
}

ScheduleCommunicationModel.setCommunicationIsSent = async function (data) {
    return new Promise(async function (resolve, reject) {
        var scheduleCampaign = {};

        if (data.hasOwnProperty('is_sent')) {
            scheduleCampaign.is_sent = data.is_sent;
        }
        try {
            var sqlDB = new MySqlDB();
            let query = 'UPDATE ' + TABLE.SCHEDULED_COMMUNICATIONS + ' SET ? WHERE id = ?';
            let result = await sqlDB.query(query, [scheduleCampaign, data.id]);
            if (result) {
                resolve(result.affectedRows)
            } else {
                throw ERROR.DEFAULT_ERROR;
            }
        } catch (e) {
            reject(e);
        }
    });
};

ScheduleCommunicationModel.addBulkScheduleCommunication = function (data) {
    return new Promise(async function (resolve, reject) {
        try {
            if (!CommonHelper.isEmpty(data)) {
                var sqlDB = new MySqlDB();
                let query = 'INSERT INTO ' + TABLE.SCHEDULED_COMMUNICATIONS + ' (campaign_id, communication_type, template_name, template_variable, recipient_name, mobile_number, email, reference_id, reference_timestamp, data_source, product_category, product_sub_category, scheduled_at) VALUES ?';
                let result = await sqlDB.query(query, [data]);
                if (result) {
                    console.log(result);
                    resolve(result.insertId)
                } else {
                    throw ERROR.DEFAULT_ERROR;
                }
            } else {
                throw ERROR.EMPTY_DATA_ERROR
            }
        } catch (e) {
            console.log(e);
            reject(e);
        }
    });
};

ScheduleCommunicationModel.parseTemplateVariable = async function (templateVariable, resultData) {
    try {
        if (CommonHelper.isJsonString(templateVariable)) {
            let finalTemplateVariables = {};
            templateVariable = JSON.parse(templateVariable);
            for (let key in templateVariable) {
                console.log(key);
                console.log(templateVariable[key]);
                console.log(CommonHelper.isJsonString(templateVariable[key]));
                if(typeof templateVariable[key] === 'object') {
                    const finalTemplateVariablesRecusively = await ScheduleCommunicationModel.parseTemplateVariable(JSON.stringify(templateVariable[key]), resultData)
                    finalTemplateVariables[key]  = JSON.parse(finalTemplateVariablesRecusively);
                } else if (!CommonHelper.isJsonString(templateVariable[key])) {
                    finalTemplateVariables = Object.assign(await this.replaceTemplateVariables(templateVariable, resultData, key), finalTemplateVariables);
                }
            }
            return JSON.stringify(finalTemplateVariables);
        } else {
            return templateVariable;
        }
    } catch (e) {
        console.log(e);
        return false;
    }
};

ScheduleCommunicationModel.replaceTemplateVariables = async function (templateVariable, resultData, key) {
    let fieldArr = "";
    if (typeof templateVariable[key] !== 'string') {
            fieldArr = "";
    } else {
        fieldArr = templateVariable[key].match(/[^{\}]+(?=})/g);
    }
    console.log(fieldArr);
    let replacedTemplateVariables = {};
    replacedTemplateVariables[key] = templateVariable[key];
    if(fieldArr) {
        for (const field of fieldArr) {
            if (field.match(/ref\[/g)) {
                refFieldData = await this.replaceRefValue(field, templateVariable, resultData);
                if (refFieldData) {
                    replacedTemplateVariables[key] = replacedTemplateVariables[key].replace('{' + field + '}', refFieldData);
                }
            } else {
                if (resultData[field] !== undefined) {
                    resultData[field] = await this.prepareFieldToCapture(resultData[field]);
                    replacedTemplateVariables[key] = replacedTemplateVariables[key].replace('{' + field + '}', resultData[field]);
                }
            }
        }
    } else {
        replacedTemplateVariables[key] = replacedTemplateVariables[key];
    }
    return replacedTemplateVariables;
};

ScheduleCommunicationModel.replaceRefValue = function (field, templateVariable, resultData) {
    let refKey = field.match(/(?<=\[).+?(?=\])/g);
    let refData = {};
    let refFieldData = '';

    if (Array.isArray(refKey)) {
        refData = templateVariable[refKey[0]];
        delete templateVariable[refKey[0]];

        if (!CommonHelper.isEmpty(refData) && refData.hasOwnProperty('function') && refData.hasOwnProperty('params')) {
            let paramFieldArr = refData['params'].match(/[^{\}]+(?=})/g);
            let paramsFieldsConcat = refData.hasOwnProperty('params_fields_concat') ? refData.params_fields_concat : false;
            let paramFieldVal = '';
            let refFunction = refData.function;
            if (paramsFieldsConcat) {
                for (const paramField of paramFieldArr) {
                    paramFieldVal += resultData[paramField];
                }
            } else {
                paramFieldVal = paramFieldArr;
            }
            if (typeof FunctionHelper[refFunction] === "function") {
                refFieldData = FunctionHelper[refFunction](paramFieldVal);
            }
        }
    }
    return refFieldData;
};

ScheduleCommunicationModel.updateBulkScheduleCommunication = function (data) {
    console.log(data.length);
    return new Promise(async function (resolve, reject) {
        try {
            if (!CommonHelper.isEmpty(data)) {
                var sqlDB = new MySqlDB();
                let query = 'UPDATE ' + TABLE.SCHEDULED_COMMUNICATIONS + ' SET is_sent = '+data.is_sent+' WHERE id IN (?)';
                let result = await sqlDB.query(query, [data.ids]);
                if (result) {
                    console.log(result);
                    resolve(result)
                } else {
                    throw ERROR.DEFAULT_ERROR;
                }
            } else {
                throw ERROR.EMPTY_DATA_ERROR
            }
        } catch (e) {
            console.log(e);
            reject(e);
        }
    });
};

/**
 * Preparing the field to be caputured in db as string.
 * 
 * @param {any} field 
 * @returns converted field
 */

ScheduleCommunicationModel.prepareFieldToCapture = (field) => {
    if(typeof field === 'object') {
        field = JSON.stringify(field);
    }
    return field;
};

module.exports = ScheduleCommunicationModel;
