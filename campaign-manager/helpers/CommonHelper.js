var qs = require('qs');
var path = require('path');
var http = require('http');
var https = require('https');
var moment = require('moment');
var useragent = require('useragent');
var cron = require('cron-validator');
var parser = require('cron-parser');
var apiLogModel = require('../app/common/models/ApiLogModel');
var tpApiLogModel = require('../app/common/models/TpApiLogModel');
var errorApiLogModel = require('../app/common/models/ErrorApiLogModel');
var elkHelper = require('./ElkHelper');
var errorHelper = require('./ErrorHelper');

module.exports = {

    getMessage: function (code) {
        var status = new Object();
        status['200'] = 'Success';
        status['201'] = 'Created';
        status['202'] = 'Accepted';
        status['203'] = 'Non-Authoritative Information';
        status['204'] = 'No Content';
        status['205'] = 'Reset Content';
        status['206'] = 'Partial Content';
        status['400'] = 'Bad Request';
        status['401'] = 'Unauthorized';
        status['402'] = 'Payment Required';
        status['403'] = 'Forbidden';
        status['404'] = 'Not Found';
        status['405'] = 'Method Not Allowed';
        status['406'] = 'Not Acceptable';
        status['407'] = 'Proxy Authentication Required';
        status['408'] = 'Request Timeout';
        status['409'] = 'Conflict';
        status['410'] = 'Gone';
        status['411'] = 'Length Required';
        status['412'] = 'Precondition Failed';
        status['413'] = 'Request Entity Too Large';
        status['414'] = 'Request-URI Too Long';
        status['415'] = 'Unsupported Media Type';
        status['416'] = 'Requested Range Not Satisfiable';
        status['417'] = 'Expectation Failed';
        status['500'] = 'Internal Server Error';
        status['501'] = 'Not Implemented';
        status['502'] = 'Bad Gateway';
        status['503'] = 'Service Unavailable';
        status['504'] = 'Gateway Timeout';
        status['505'] = 'HTTP Version Not Supported';
        status['509'] = 'Bandwidth Limit Exceeded';
        return status[code];
    },

    sendSuccessResponse: function (req, res, data) {
        this.sendResponse(req, res, 200, false, data);
    },

    sendErrorResponse: function (req, res, errors) {
        this.sendResponse(req, res, 400, false, false, errors);
    },

    sendResponse: function (req, res, status, message, data, errors) {
        var errorType = 1;
        var response = new Object();

        if (status) {
            if (status == 400 || status == 401) {
                errorType = 2;
            }
            response.status = status;
            response.message = this.getMessage(status);
            response.cached = req.cached;
        }
        if (message) {
            response.message = message;
        }
        if (data) {
            response.data = data;
        }
        if (errors) {
            if (typeof errors === 'string') {
                error = errorHelper.formatError('ERR400', 'error', errors);
                errors = new Array(error);
            }
            if (errors instanceof Error) {
                error = errorHelper.formatError('ERR500', 'error', '', errors.stack);
                errors = new Array(error);
            }
            response.errors = errors;
        }

        var urlParts = require('url').parse(req.url, true);
        var urlPathname = urlParts.pathname;
        var url = req.protocol + '://' + req.headers.host + urlPathname;

        if (config.byPassLog.indexOf(urlPathname) == -1) {
            if (config.apiLog) {
                var query = {};

                if (req.method == 'GET') {
                    query = req.query;
                }
                if (req.method == 'POST') {
                    query = req.body;
                }

                if (req.apiLogId) {
                    apiLogModel.updateApiLog(req.apiLogId, response);
                }

                // apiLogModel.addApiLog(url, req.method, query, response, userIp, userAgent, userDevice);
            }
            if (config.elkLog) {
                elkHelper.log(req, response, errorType);
            }
        } else {
            if (config.report.byPassLogError && response.hasOwnProperty('errors')) {
                var error = '';
                var data = {};
                data.templateName = config.report.byPassLogErrorTemplateName;
                data.emailTo = config.report.byPassLogErrorTo;
                data.referenceId = 1;
                error = JSON.stringify(response.errors);
                data.params = {'URL': url, 'ERROR': error};
                module.exports.sendEmail(data).catch(function (e) {
                    console.log(e);
                });
            }
        }
        if (!res.headersSent) {
            res.status(status).send(response);
        }
    },

    sendGetRequestToBrokerage: function (query, path) {
        return new Promise(async function (resolve, reject) {
            var options = {
                host: config.insuranceBrokerage.host,
                protocol: config.insuranceBrokerage.protocol,
                path: path
            };
            try {
                let result = await module.exports.sendGetRequest(query, options, true);
                if (result.data) {
                    resolve(result.data);
                } else if (result.errors) {
                    throw result.errors;
                } else {
                    throw ERROR.DEFAULT_ERROR;
                }
            } catch (e) {
                reject(e);
            }
        });
    },

    sendPostRequestToBrokerage: function (query, path) {
        return new Promise(async function (resolve, reject) {
            var options = {
                host: config.insuranceBrokerage.host,
                path: path
            };
            try {
                let result = await module.exports.sendPostRequest(query, options);
                if (result.data) {
                    resolve(result.data);
                } else if (result.errors) {
                    throw result.errors;
                } else {
                    throw ERROR.DEFAULT_ERROR;
                }
            } catch (e) {
                reject(e);
            }
        });
    },

    sendPostRequestToCommunication: function (query, path) {
        return new Promise(async function (resolve, reject) {
            var options = {
                host: config.insuranceCommunication.host,
                protocol: config.insuranceCommunication.protocol,
                path: path,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-id': config.insuranceCommunication.xAuthId,
                    'x-auth-token': config.insuranceCommunication.xAuthToken,
                }
            }
            try {
                let result = await module.exports.sendPostRequest(query, options);
                if (result) {
                    resolve(result);
                } else {
                    throw ERROR.DEFAULT_ERROR;
                }
            } catch (e) {
                reject(e);
            }
        });
    },

    sendPostRequestToMotorLMW: function (query, path) {
        return new Promise(async function (resolve, reject) {
            var options = {
                host: config.motorLmw.host,
                protocol: config.motorLmw.protocol,
                path: path
            }
            try {
                let result = await module.exports.sendPostRequest(query, options);
                if (result.data) {
                    resolve(result.data);
                } else {
                    throw ERROR.DEFAULT_ERROR;
                }
            } catch (e) {
                reject(e);
            }
        });
    },

    sendPostRequestToHealthLMW: function (query, path) {
        return new Promise(async function (resolve, reject) {
            var options = {
                host: config.healthLmw.host,
                protocol: config.healthLmw.protocol,
                path: path
            }
            try {
                let result = await module.exports.sendPostRequest(query, options);
                if (result.result.data) {
                    resolve(result.result.data);
                } else {
                    throw ERROR.DEFAULT_ERROR;
                }
            } catch (e) {
                reject(e);
            }
        });
    },

    sendPostRequestToTravelLMW: function (query, path) {
        return new Promise(async function (resolve, reject) {
            var options = {
                host: config.travelLmw.host,
                protocol: config.travelLmw.protocol,
                path: path
            }
            try {
                let result = await module.exports.sendPostRequest(query, options);
                if (result.data.data) {
                    resolve(result.data.data);
                } else {
                    throw ERROR.DEFAULT_ERROR;
                }
            } catch (e) {
                reject(e);
            }
        });
    },
    /**
     * Parses a URL and extracts its components.
     *
     * @param {string} urlString - The URL to be parsed.
     * @returns {Object} - An object containing the parsed components of the URL.
     * @property {string} protocol - The protocol (e.g., 'https').
     * @property {string} domain - The domain of the URL.
     * @property {string} path - The path of the URL.
     */
    parseUrl: (urlString) => {
        // Split the URL into protocol, domain, and path components
        const [protocol, ...rest] = urlString.split('//');
        const [domain, ...path] = rest.join('//').split('/');

        // Return an object with parsed components
        return {
            protocol: protocol || 'https',
            domain,
            path: path.join('/')
        };
    },

    prepareAndSendPostRequest: async function (data) {
        const { protocol = 'https', domain, path } = this.parseUrl(data.request_path);
        const options = {
            host: domain,
            protocol: protocol || 'https',
            path: `/${path}`,
            headers: data?.headers,
        }
        try {
            const result = await module.exports.sendPostRequest(JSON.parse(data.request_body), options);
            if (result) {
                return result;
            } else {
                throw ERROR.DEFAULT_ERROR;
            }
        } catch (e) {
            throw new Error('Error in Post request api : ', "Failure in third party request", e);
        };
    },

    prepareAndSendGetRequest: async function (query) {

        const { protocol = 'https', domain, path } = this.parseUrl(query.request_path);
        const options = {
            host: domain,
            protocol: protocol || 'https',
            path: `/${path}`,
            headers: data?.headers,
        };
        try {
            const result = await module.exports.sendGetRequest(query.request_params, options, true);
            if (result.data) {
                resolve(result.data);
            } else if (result.errors) {
                throw result.errors;
            } else {
                throw ERROR.DEFAULT_ERROR;
            }
        } catch (e) {
            throw new Error('Error in Post request api : ', "Failure in third party request", e);
        }
    },

    prepareAndSendPutRequest: async function (query) {

        const { protocol = 'https', domain, path } = this.parseUrl(data.request_path);
        const options = {
            host: domain,
            protocol: protocol || 'https',
            path: `/${path}`,
            headers: data?.headers,
        };
        try {
            const result = await module.exports.sendPutRequest(query.request_body, options, true);
            if (result.data) {
                resolve(result.data);
            } else if (result.errors) {
                throw result.errors;
            } else {
                throw ERROR.DEFAULT_ERROR;
            }
        } catch (e) {
            throw new Error('Error in Post request api : ', "Failure in third party request", e);
        }
    },
    
    prepareAndSendRequest: function (data) {

        switch (data.request_method) {
            case 'POST':
                return this.prepareAndSendPostRequest(data);
            case 'GET':
                return this.prepareAndSendGetRequest(data);
            case 'PUT':
                return this.prepareAndSendPutRequest(data);
            default:
                // Handle unsupported request methods
                throw new Error(`Unsupported request method: ${requestMethod}`);
        }
    },      

    sendPostRequestToBulkCommunication: function (query, path) {
        return new Promise(async function (resolve, reject) {
            var options = {
                host: config.insuranceBulkCommunication.host,
                protocol: config.insuranceBulkCommunication.protocol,
                path: path,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.insuranceBulkCommunication.x_api_key
                }
            }
            try {
                let result = await module.exports.sendPostRequest(query, options);
                if (result) {
                    resolve(result);
                } else {
                    throw ERROR.DEFAULT_ERROR;
                }
            } catch (e) {
                reject(e);
            }
        });
    },

    getShortenUrlFromITMS: function (url) {
        return new Promise(async function (resolve, reject) {
            let query = {
                url : url,
                request_medium: 'campaign-manager',
            };
            let options = {
                protocol: config.insuranceItms.protocol, 
                host: config.insuranceItms.host,
                path: '/urlShortner',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-id': config.insuranceItms.xAuthId,
                    'x-auth-token': config.insuranceItms.xAuthToken,
                }
            }
            try {
                let result = await module.exports.sendGetRequest(query, options);
                if (result) {
                    resolve(result);
                } else {
                    throw ERROR.DEFAULT_ERROR;
                }
            } catch (e) {
                reject(e);
            }
        });
    },

    sendGetRequest: function (query, options) {
        return new Promise(async function (resolve, reject) {
            var data = {};
            var protocol = https;
            var protocolStr = 'https';
            var url = options.path;

            options.method = 'GET';

            if (query) {
                var queryStr = qs.stringify(query);
                options.path += '?' + queryStr;
            }

            if (options.protocol && options.protocol == 'http') {
                protocol = http;
                protocolStr = 'http';
            }

            delete options.protocol;

            url = protocolStr + '://' + options.host + url;
            data.url = url;
            data.method = options.method;
            data.request = query;
            data.response = {};

            var logId = await tpApiLogModel.addApiLog(data.url, data.method, data.request, data.response, '', '', '');

            var request = protocol.request(options, function (response) {
                response.setEncoding('utf8');
                var responseData = '';
                response.on('data', function (data) {
                    responseData += data;
                });
                response.on('end', function () {
                    try {
                        data.response = JSON.parse(responseData);
                        if (config.apiLog && config.byPassLog.indexOf(url) == -1) {
                            tpApiLogModel.updateApiLog(logId, data.response);
                            // tpApiLogModel.addApiLog(data.url, data.method, data.request, data.response, '', '', '');
                        }
                        resolve(data.response);
                    } catch (err) {
                        console.log(err);
                        tpApiLogModel.updateApiLog(logId, responseData);
                        reject(ERROR.DEFAULT_ERROR);
                    }
                });
            });
            request.on('error', function (e) {
                console.log('problem with request:' + e.message + ' on ' + moment().format('YYYY-MM-DD HH:mm:ss'));
                reject(ERROR.DEFAULT_ERROR);
            });
            request.end();
        });
    },

    sendPostRequest: async function (query, options) {
        return new Promise(async function (resolve, reject) {
            var queryStr;
            var data = {};
            var protocol = https;
            var protocolStr = 'https';

            options.method = 'POST';

            if (options.headers) {
                if (options.headers['Content-Type'] && options.headers['Content-Type'] == 'application/json') {
                    queryStr = JSON.stringify(query);
                } else {
                    queryStr = qs.stringify(query);
                }
            } else {
                options.headers = {};
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                queryStr = qs.stringify(query);
            }

            //options.headers['Content-Length'] = queryStr.length;

            if (options.protocol && options.protocol == 'http') {
                protocol = http;
                protocolStr = 'http';
            }

            delete options.protocol;

            var url = protocolStr + '://' + options.host + options.path;
            data.url = url;
            data.method = options.method;
            data.request = query;
            data.response = {};

            var logId = await tpApiLogModel.addApiLog(data.url, data.method, data.request, data.response, '', '', '');

            var request = protocol.request(options, function (response) {
                response.setEncoding('utf8');
                var responseData = '';
                response.on('data', function (data) {
                    responseData += data;
                });
                response.on('end', function () {
                    try {
                        console.log(responseData);
                        data.response = JSON.parse(responseData);
                        if (config.apiLog && config.byPassLog.indexOf(url) == -1) {
                            tpApiLogModel.updateApiLog(logId, data.response);
                            // tpApiLogModel.addApiLog(data.url, data.method, data.request, data.response, '', '', '');
                        }
                        resolve(data.response);
                    } catch (err) {
                        console.log(err);
                        tpApiLogModel.updateApiLog(logId, responseData);
                        reject(ERROR.DEFAULT_ERROR);
                    }
                });
            });
            request.on('error', function (e) {
                console.log('problem with request:' + e.message + ' on ' + moment().format('YYYY-MM-DD HH:mm:ss'));
                reject(ERROR.DEFAULT_ERROR);
            });
            request.write(queryStr);
            request.end();
        });
    },

    sendPutRequest: async function (query, options) {
        return new Promise(async function (resolve, reject) {
            var queryStr;
            var data = {};
            var protocol = https;
            var protocolStr = 'https';

            options.method = 'PUT';

            if (options.headers) {
                if (options.headers['Content-Type'] && options.headers['Content-Type'] == 'application/json') {
                    queryStr = JSON.stringify(query);
                } else {
                    queryStr = qs.stringify(query);
                }
            } else {
                options.headers = {};
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                queryStr = qs.stringify(query);
            }

            //options.headers['Content-Length'] = queryStr.length;

            if (options.protocol && options.protocol == 'http') {
                protocol = http;
                protocolStr = 'http';
            }

            delete options.protocol;

            var url = protocolStr + '://' + options.host + options.path;
            data.url = url;
            data.method = options.method;
            data.request = query;
            data.response = {};

            var logId = await tpApiLogModel.addApiLog(data.url, data.method, data.request, data.response, '', '', '');

            var request = protocol.request(options, function (response) {
                response.setEncoding('utf8');
                var responseData = '';
                response.on('data', function (data) {
                    responseData += data;
                });
                response.on('end', function () {
                    try {
                        console.log(responseData);
                        data.response = JSON.parse(responseData);
                        if (config.apiLog && config.byPassLog.indexOf(url) == -1) {
                            tpApiLogModel.updateApiLog(logId, data.response);
                            // tpApiLogModel.addApiLog(data.url, data.method, data.request, data.response, '', '', '');
                        }
                        resolve(data.response);
                    } catch (err) {
                        console.log(err);
                        tpApiLogModel.updateApiLog(logId, responseData);
                        reject(ERROR.DEFAULT_ERROR);
                    }
                });
            });
            request.on('error', function (e) {
                console.log('problem with request:' + e.message + ' on ' + moment().format('YYYY-MM-DD HH:mm:ss'));
                reject(ERROR.DEFAULT_ERROR);
            });
            request.write(queryStr);
            request.end();
        });
    },

    addApiLogRequest: function (req, res) {
        return new Promise(async function (resolve, reject) {
            try {
                var logId = '';
                var response = new Object();
                var agent = useragent.parse(req.headers['user-agent']);
                var userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : '');
                var userAgent = agent.toString();
                var userDevice = req.device && req.device.type ? req.device.type : '';

                var urlParts = require('url').parse(req.url, true);
                var urlPathname = urlParts.pathname;
                var url = req.protocol + '://' + req.headers.host + urlPathname;
                var extname = path.extname(urlPathname);

                if (config.byPassLog.indexOf(urlPathname) == -1 && !extname) {
                    if (config.apiLog) {
                        var query = {};
                        if (req.method == 'GET') {
                            query = req.query;
                        }
                        if (req.method == 'POST') {
                            query = req.body;
                        }
                        logId = await apiLogModel.addApiLog(url, req.method, query, response, userIp, userAgent, userDevice);
                    }
                }
                resolve(logId)
            } catch (e) {
                reject(e);
            }
        });
    },

    capitalizeFirstLetter: function (str) {
        return str.charAt(0).toUpperCase() + str.substr(1);
    },

    isEmpty: function (value) {
        if(value) {
            if (Array.isArray(value) && value.length === 0) {
                return true;
            }  
            if (Object.keys(value).length === 0 && value.constructor === Object) {
                return true;
            }
        }
        if (!value || value === '0') {
            return true;
        }
        return false;
    },

    removeMultipleSpace: function (str) {
        return str.replace(/\s\s+/g, ' ');
    },

    removeSpace: function (str) {
        return str.replace(/\s/g, '');
    },

    removeLineCharacters: function (str) {
        return str.replace(/\r?\n|\r/g, ' ');
    },

    isJsonString: function (data) {
        if (typeof data !== 'string') {
            return false;
        }
        try {
            JSON.parse(data);
        } catch (e) {
            return false;
        }
        return true;
    },

    isValidCronExpression: function (expr) {
        try {
            if (cron.isValidCron(expr)) {
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    },

    getNextCronTime: function (expr) {
        try {
            let interval = parser.parseExpression(expr);
            let nextTime = interval.next().toISOString();

            nextTime = moment(nextTime).format('YYYY-MM-DD HH:mm:ss');
            return nextTime;

        } catch (e) {
            return;
        }
        return;
    },

    getPreviousCronTime: function (expr) {
        try {
            let interval = parser.parseExpression(expr);
            let previousTime = interval.prev().toISOString();
            previousTime = moment(previousTime).format('YYYY-MM-DD HH:mm:ss');
            return previousTime;
        } catch (e) {
            return;
        }
        return;
    },

    getQueryParam: function (queryParam) {
        try {
            let params = {};           
            let keys = Object.keys(queryParam);
            if(!this.isEmpty(keys)){
                for(let key of keys){
                    let dateTime = moment();
                    if(queryParam.hasOwnProperty(key)){
                        if(queryParam[key].hasOwnProperty('variable')){
                            if(queryParam[key].variable == 'CURRENT_DATE'){
                                dateTime = moment().format('YYYY-MM-DD');
                            } else {
                                dateTime = queryParam[key].variable;
                            }
                        }
                        if(queryParam[key].hasOwnProperty('method')){           
                            if(queryParam[key].method == 'add'){
                                dateTime = moment(dateTime).add(queryParam[key].date_param);
                            }
                            if(queryParam[key].method == 'subtract'){
                                dateTime = moment(dateTime).subtract(queryParam[key].date_param);
                            }
                        }
                        dateTime = moment(dateTime).format('YYYY-MM-DD HH:mm:ss');
                        params[key] = dateTime;
                    }
                }
            }
            return params;
        } catch (e) {
            console.log(e)
            return;
        }
        return;
    },

    escapeRegExp: function (str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    isNameSame: function (name1, name2) {
        name1 = name1.replace(/[^a-z0-9]+/gi, " ");
        name2 = name2.replace(/[^a-z0-9]+/gi, " ");

        name1 = name1.toLowerCase();
        name2 = name2.toLowerCase();

        if (config.nameTitle && config.nameTitle.length > 0) {
            var isTitleRemovedFromName1 = false;
            var isTitleRemovedFromName2 = false;
            for (var i = 0; i < config.nameTitle.length; i++) {
                var title = config.nameTitle[i].toLowerCase();
                if (!isTitleRemovedFromName1 && name1.startsWith(title)) {
                    name1 = name1.replace(title, "");
                    isTitleRemovedFromName1 = true;
                }
                if (!isTitleRemovedFromName2 && name2.startsWith(title)) {
                    name2 = name2.replace(title, "");
                    isTitleRemovedFromName2 = true;
                }
            }
        }

        name1 = module.exports.removeSpace(name1);
        name2 = module.exports.removeSpace(name2);

        if (name1 == name2) {
            return true;
        }
        return;
    },

    dateValidator: function (date) {
        return moment(date, "YYYY-MM-DD").isValid();
    },

    dateTimeValidator: function (date) {
        return moment(date, "YYYY-MM-DD HH:mm:ss").isValid();
    },

    jsonValidator: function (data) {
        if (typeof data !== "string") {
            return false;
        }
        try {
            JSON.parse(data);
            return true;
        } catch (error) {
            //console.log(error);
            return false;
        }
    },

    validateCronExpression: function (expression) {
        var cronregex = new RegExp(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/);
        return cronregex.test(expression);
    },

    /**
     * Replaces variables in a JSON object with corresponding values from a data object.
     *
     * @param {Object} jsonObject - The JSON object containing variables to replace.
     * @param {Object} data - The data object providing replacement values.
     * @returns {Object|null} - The updated JSON object with replaced variables.
     */
    replaceVariables: (jsonObject, data) => {
        // Validate input
        if (!jsonObject || !data || typeof jsonObject !== 'object') {
            return null;
        }

        // Recursive function to replace variables in string values
        const replaceValue = (value) => {
            if (typeof value === 'string') {
                return value.replace(/\$\{([\w.]+)\}/g, (match, variable) => {
                    const replacement = _.get(data, variable);
                    return replacement !== undefined ? replacement : match;
                });
            } else if (typeof value === 'object') {
                return this.replaceVariables(value, data);
            }
            return value;
        };

        // Replace variables in all key-value pairs of the JSON object
        const replacedObject = Object.keys(jsonObject).reduce((acc, key) => {
            const value = jsonObject[key];
            acc[key] = replaceValue(value);
            return acc;
        }, {});

        return replacedObject;
    },

    /**
     * Processes an array of callbacks in batches and returns the combined results.
     *
     * @param {Array<Function>} arrayOfCallbacks - Array of callback functions to process.
     * @param {number} batchSize - The size of each processing batch.
     * @returns {Promise<Array>} - A promise that resolves to an array of results from all batches.
     */
    processInBatches: async (arrayOfCallbacks, batchSize) => {
        const totalCallbacks = arrayOfCallbacks.length;
        const numberOfBatches = Math.ceil(totalCallbacks / batchSize);
        const batches = [];

        // Split the array of callbacks into batches
        for (let i = 0; i < numberOfBatches; i++) {
            const start = i * batchSize;
            const end = (i + 1) * batchSize;
            const batch = arrayOfCallbacks.slice(start, end);
            batches.push(batch);
        }

        const results = [];

        // Process batches in parallel using Promise.all
        await Promise.all(
            batches.map(async (batch) => {
                const batchResults = await Promise.all(batch);
                results.push(...batchResults);
            })
        );

        return results;
    }

}
