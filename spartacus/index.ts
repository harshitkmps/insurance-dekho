/*
* @author Ankit Shukla
* @usage base file for project.
*/

// creating an express instance for server
import newrelic from 'newrelic/index';
const express = require('express');
const app = express();
const { v4 } =  require("uuid");
import logger from '@config/services/WinstonConfig';

// logging
const blame = require('blame');
const morgan = require('morgan');
import storage from '@helpers/StorageHelper';
import Constants from '@app/utils/constants/Constants';
import CommonHelper from '@app/utils/helpers/CommonHelper';

// using dotenv file for managing environment variables
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');

// importing custom response builder
import response from '@helpers/ResponseBuilder';

// service is booting up indication
logger.info(`Starting "Spartacus" on port : ${process.env.PORT}`);

import loggerObj from '@controllers/LoggerController';
let x_correlation_id: any;

app.use((req: any, res: any, next:any) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Source");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Source');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// use winston as logger for morgan middleware
app.use(morgan('combined', {stream: logger.stream}));

// capturing correlation-id for each request
app.use((req: any, res: any, next: any) => {
    const store = new Map();
    x_correlation_id = v4();
    res.set('x-correlation-id', x_correlation_id);
    storage.setCorrelationId(x_correlation_id, store, next);
})

// health check
app.use((req: any, res: any, next: any) => {
    if (req.url === '/health') {
        return res.send('THIS IS SPARTA.');
    }    
    next();
})

// perform api validation before sending
/* 
app.use((req: any, res: any, next: any) => {
    const digest = req.headers.digest;
    if (!digest || digest !== process.env.DIGEST) {
        loggerObj.generateApiLog(req, res, next);
        return res.status(404).send(COMMON_RESPONSES.INVALID_REQUEST);
    }
    next();
});
*/

// update logs as per response
app.use( (req: any, res: any, next: any) => {
    res.return = async (code: any, type: any, destination: number, result:any, display_message: any) => {
        storage.setMetaData({response_type : type, response_code: code, request_destination : destination, response_display_message: display_message});
        storage.setStackTraceData(CommonHelper.prepareStackTrace(Constants.STACK_TRACE.TYPE.SUCCESS,blame.stack(),'Response Returned Successfully'));
        loggerObj.generateApiLog(req, res, result);
        return res.status(code).json(response.build(type, result, display_message));
    };
    res.error = async (code:any, type:any, destination: number, result:any, display_message: any) => {
        storage.setMetaData({response_type : type, response_code: code, request_destination : destination, response_display_message: display_message});
        storage.setStackTraceData(CommonHelper.prepareStackTrace(Constants.STACK_TRACE.TYPE.FAILURE,blame.stack(),'Error Response Returned'));
        loggerObj.generateApiLog(req, res, result);
        loggerObj.generateErrorLog(req, res, result);
        return res.status(code).json(response.error(type, result, display_message));
    };
    next();
})

if(process.env.ENV == 'UAT') {
    require('@app/jobs/');
}
require('@app/routes')(app);

// request endpoint not found.
app.use(async (req: any, res: any) => {
    storage.setMetaData({response_type : "URL_NOT_FOUND", response_code: 404, response_display_message: "Invalid url, please check url"});
    storage.setStackTraceData(CommonHelper.prepareStackTrace(Constants.STACK_TRACE.TYPE.FAILURE,blame.stack(),'Invalid Endpoint Returned'));
    loggerObj.generateApiLog(req, res, {});
    return res.status(404).send(response.error("URL_NOT_FOUND", {error_desc: "Please check for endpoint"}, "Invalid url, please check url"));
});

// logging for unhandled exceptions
process.on('uncaughtException', async (reason: any) => {
    loggerObj.generateUnhandledErrorLog(reason);
})

// run server on specific port
app.listen(process.env.PORT);
export default app;