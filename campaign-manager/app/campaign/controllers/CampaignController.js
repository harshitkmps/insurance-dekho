/* global config, HELPER_PATH, commonModel, registrationModel, BASE_DIR, ERROR, db */

var path    = require('path');
var qs      = require('qs');
var moment  = require('moment');
var uuid = require("uuid");
var ApiController               = require('../../common/controllers/ApiController');
var CampaignModel               = require('../models/common/CampaignModel');
var CampaignCommunicationModel = require('../models/communication/CampaignCommunicationModel');
const CampaignRewardModel = require('../models/reward/CampaignRewardModel');
var CampaignService = require('../services/CampaignService');
const PollingService = require('../services/PollingService');
var CommunicationService             = require('../services/CommunicationService');
const ScheduleRewardService = require('../services/ScheduleRewardService');
var CommonHelper = require(HELPER_PATH + 'CommonHelper.js');
const MissingRequestParameter = require('../../error/MissingRequestParameter');
const InvalidRequestParameter = require('../../error/InvalidRequestParameter');
const CampaignApiModel = require('../models/api/CampaignApiModel');
const ScheduleApiService = require('../services/ScheduleApiService');
const CONSTANTS = require('../../../config/constants');

class CampaignController extends ApiController{
    constructor() {
        super();
    }
}

CampaignController.addCampaign = async function(req, res){
    let errors = new Array();

    if(!req.body.name){
        var error = this.formatError('ERR10001', 'name');
        errors.push(error);
    }
    if(!req.body.start_date){
        var error = this.formatError('ERR10001', 'start_date');
        errors.push(error);
    }
    if((req.body.start_date && !CommonHelper.dateTimeValidator(req.body.start_date))){
        var error = this.formatError('ERR10012', 'start_date');
        errors.push(error);
    }
    if((req.body.end_date && !CommonHelper.dateTimeValidator(req.body.end_date))){
        var error = this.formatError('ERR10012', 'end_date');
        errors.push(error);
    }
    if (req.body.type && !CONSTANTS.ALLOWED_CAMPAIGN_TYPE.has(req.body.type)) {
        var error = this.formatError('ERR10020', 'type');
        errors.push(error);
    }
    if(!req.body.query){
        var error = this.formatError('ERR10009', 'query');
        errors.push(error);
    }
    if(!req.body.query_param){
        var error = this.formatError('ERR10009', 'query_param');
        errors.push(error);
    }
    if(!req.body.db_type){
        var error = this.formatError('ERR10001', 'db_type');
        errors.push(error);
    }
    if((req.body.db_type && !(req.body.db_type.toLowerCase() in config.dbType))){
        var error = this.formatError('ERR10014', 'db_type');
        errors.push(error);
    }
    if(!req.body.data_source){
        var error = this.formatError('ERR10001', 'data_source');
        errors.push(error);
    }
    if((req.body.config && !CommonHelper.isJsonString(req.body.config))){
        var error = this.formatError('ERR10013', 'config');
        errors.push(error);
    }
    
    try{
        if(!errors.length){
            let data = {}; 

            data.uuid       = uuid.v4();
            data.name       = req.body.name?req.body.name.trim():'';
            data.type = req.body.type
              ? req.body.type
              : CONSTANTS.DEFAULT_CAMPAIGN_TYPE;
            data.description= req.body.description?req.body.description:'';
            data.start_date = req.body.start_date?req.body.start_date:'';
            data.end_date   = req.body.end_date?req.body.end_date:'';
            data.query      = req.body.query?req.body.query:'';
            data.query_param= req.body.query_param?req.body.query_param:'';
            data.db_type    = req.body.db_type?config.dbType[req.body.db_type.toLowerCase()]:'';
            data.data_source= req.body.data_source?req.body.data_source:'';
            data.config     = req.body.config?req.body.config:'';
            data.status     = req.body.status?req.body.status:'';
            data.created_by = req.body.created_by?req.body.created_by:'';
            data.updated_by = req.body.updated_by?req.body.updated_by:'';
            data.handler = req.body.handler ? req.body.handler : '';

            let campaignId = await CampaignModel.addCampaign(data); 
            
            if(campaignId){
                this.sendResponse(req, res, 200, false, {id:campaignId}, false);
            }else{
                throw ERROR.DEFAULT_ERROR;
            }
        }else{
            throw errors;
        }
    }catch(e){
        console.log(e);
        this.sendResponse(req, res, 400, false, false, e);
    }    
}


CampaignController.updateCampaign = async function(req, res){
    let errors = new Array();
    
    if(!req.body.id){
        var error = this.formatError('ERR10017', 'id');
        errors.push(error);
    }
    if((req.body.start_date && !CommonHelper.dateTimeValidator(req.body.start_date))){
        var error = this.formatError('ERR10012', 'start_date');
        errors.push(error);
    }
    if((req.body.end_date && !CommonHelper.dateTimeValidator(req.body.end_date))){
        var error = this.formatError('ERR10012', 'end_date');
        errors.push(error);
    }
    if (req.body.type && !CONSTANTS.ALLOWED_CAMPAIGN_TYPE.has(req.body.type)) { 
        var error = this.formatError('ERR10020', 'type');
        errors.push(error);
    }
    if((req.body.db_type && !(req.body.db_type.toLowerCase() in config.dbType))){
        var error = this.formatError('ERR10014', 'db_type');
        errors.push(error);
    }
    if((req.body.config && !CommonHelper.isJsonString(req.body.config))){
        var error = this.formatError('ERR10013', 'config');
        errors.push(error);
    }

    try{
        if(!errors.length){            
            let affectedRows = await CampaignModel.updateCampaign(req.body);
            if(affectedRows){
                this.sendResponse(req, res, 200, false, {id:req.body.id}, false);
            }else{
                throw ERROR.DEFAULT_ERROR;
            }
        }else{
            throw errors;
        }
    }catch(e){
        console.log(e);
        this.sendResponse(req, res, 400, false, false, e);
    }
}

CampaignController.scheduleCampaign = async function(req, res) {
    await CampaignService.schedule('communication');
    return res.sendStatus(200);
};
CampaignController.scheduleCommunication = async function(req, res) {
    await PollingService.pollAndScheduleData('communication');
    return res.sendStatus(200);
};
CampaignController.sendCommunication = async function(req, res) {
    await CommunicationService.sendCommunication();
    return res.sendStatus(200);
};


CampaignController.getCampaign = async function(req, res){
 //   await CampaignService.scheduleCampaign();
//     await ScheduleCommunicationService.scheduleCommunication();
//         await CommunicationService.sendCommunication();

    let errors = new Array();
    if(!req.query.id){
        var error = this.formatError('ERR10007', 'id');
        errors.push(error);
    }
    try{
        if(!errors.length){
            let campaign = await CampaignModel.getCampaign(req.query.id);
            
            if(campaign.length > 0){                
                this.sendResponse(req, res, 200, false, campaign, false);
            }else{
                throw ERROR.CAMPAIGN_NOT_FOUND;
            }
        }else{
            throw errors;
        }  
    }catch(e){
        this.sendResponse(req, res, 400, false, false, e);
    }   
}


CampaignController.addCampaignCommunication = async function(req, res){
    let errors = new Array();

    if(!req.body.campaign_id){
        var error = this.formatError('ERR10017', 'campaign_id');
        errors.push(error);
    }
    if(!req.body.communication_type|| (req.body.communication_type && !(req.body.communication_type.toUpperCase() in config.communicationType))){
        var error = this.formatError('ERR10015', 'communication_type');
        errors.push(error);
    }
    if(!req.body.template_name){
        var error = this.formatError('ERR10016', 'template_name');
        errors.push(error);
    }
    if(!req.body.template_variable){
        var error = this.formatError('ERR10016', 'template_variable');
        errors.push(error);
    }
    if(!req.body.cron_expression){
        var error = this.formatError('ERR10017', 'cron_expression');
        errors.push(error);
    }
    if((req.body.config && !CommonHelper.isJsonString(req.body.config))){
        var error = this.formatError('ERR10013', 'config');
        errors.push(error);
    }
    if((req.body.cron_expression && !CommonHelper.isValidCronExpression(req.body.cron_expression))){
        var error = this.formatError('ERR10018', 'cron_expression');
        errors.push(error);
    }
    if(!CommonHelper.isJsonString(req.body.template_variable)){
        var error = this.formatError('ERR10019', 'template_variable');
        errors.push(error);
    }
    

    try{
        if(!errors.length){
            let data = {}; 

            data.campaign_id       = req.body.campaign_id?req.body.campaign_id:'';
            data.communication_type= req.body.communication_type?config.communicationType[req.body.communication_type.toUpperCase()]:'';             
            data.template_name     = req.body.template_name?req.body.template_name:'';
            data.template_variable = req.body.template_variable?req.body.template_variable:'';
            data.utm_source        = req.body.utm_source?req.body.utm_source:null;
            data.utm_medium        = req.body.utm_medium?req.body.utm_medium:'';
            data.utm_campaign      = req.body.utm_campaign?req.body.utm_campaign:'';
            data.cron_expression   = req.body.cron_expression?req.body.cron_expression:'';
            data.config            = req.body.config?req.body.config:'';
            data.is_shorten_url    = req.body.is_shorten_url?req.body.is_shorten_url: 0;
            data.ignore_duplicate_record    = req.body.ignore_duplicate_record?req.body.ignore_duplicate_record: 0;
            data.status            = req.body.status?req.body.status:0;
            data.created_by        = req.body.created_by?req.body.created_by:'';
            data.updated_by        = req.body.updated_by?req.body.updated_by:'';

            let campaignCommunicationId = await CampaignCommunicationModel.addCampaignCommunication(data); 
            
            if(campaignCommunicationId){
                this.sendResponse(req, res, 200, false, {id:campaignCommunicationId}, false);
            }else{
                throw ERROR.DEFAULT_ERROR;
            }
        }else{
            throw errors;
        }
    }catch(e){
        console.log(e);
        this.sendResponse(req, res, 400, false, false, e);
    }    
}


CampaignController.updateCampaignCommunication = async function(req, res){
    let errors = new Array();
    
    if(!req.body.id){
        var error = this.formatError('ERR10017', 'id');
        errors.push(error);
    }
    
    if(!req.body.communication_type|| (req.body.communication_type && !(req.body.communication_type.toUpperCase() in config.communicationType))){
        var error = this.formatError('ERR10015', 'communication_type');
        errors.push(error);
    }
    if((req.body.config && !CommonHelper.isJsonString(req.body.config))){
        var error = this.formatError('ERR10013', 'config');
        errors.push(error);
    }
    if((req.body.cron_expression && !CommonHelper.isValidCronExpression(req.body.cron_expression))){
        var error = this.formatError('ERR10018', 'cron_expression');
        errors.push(error);
    }
    if(req.body.template_variable && !CommonHelper.isJsonString(req.body.template_variable)){
        var error = this.formatError('ERR10019', 'template_variable');
        errors.push(error);
    }

    try{
        if(!errors.length){            
            let campaignCommunicationId = await CampaignCommunicationModel.updateCampaignCommunication(req.body);
            if(campaignCommunicationId){
                this.sendResponse(req, res, 200, false, {id:req.body.id}, false);
            }else{
                throw ERROR.DEFAULT_ERROR;
            }
        }else{
            throw errors;
        }
    }catch(e){
        console.log(e);
        this.sendResponse(req, res, 400, false, false, e);
    }
}


CampaignController.getCampaignCommunication = async function(req, res){
    let errors = new Array();
   
    if(!req.query.id){
        var error = this.formatError('ERR10007', 'id');
        errors.push(error);
    }
    
    try{
        if(!errors.length){
            let campaignCommunication = await CampaignCommunicationModel.getCampaignCommunication(req.query.id);
            if(campaignCommunication.length > 0){                
                this.sendResponse(req, res, 200, false, campaignCommunication, false);
            }else{
                throw ERROR.CAMPAIGN_COMMUNICATION_NOT_FOUND;
            }
        }else{
            throw errors;
        }  
    }catch(e){
        this.sendResponse(req, res, 400, false, false, e);
    }   
}

CampaignController.addCampaignRewards = async function (req, res, next) {
    const body = req.body;

    let missing_parameters = new Array();
    if (!body.campaign_id) {
      missing_parameters.push('campaign_id');
    }
    if (!body.cron_expression) {
      missing_parameters.push('cron_expression');
    }
    if (!body.rule_identifier) {
      missing_parameters.push('rule_identifier');
    }
    if (!body.unique_id_format) {
        missing_parameters.push('unique_id_format');
    }
    if (!body.tenant) {
        missing_parameters.push('tenant');
    }
    if (!body.points_type) {
        missing_parameters.push('points_type');
    }
    if (!body.description) {
        missing_parameters.push('description');
    }
    if (missing_parameters.length > 0) {
        next(
          new MissingRequestParameter(
            'missing request parameters',
            missing_parameters
          ),
          req,
          res
        );
    }
    if (body.config && !CommonHelper.isJsonString(body.config)) {
        next(new InvalidRequestParameter('config should be json', ['config']), req, res);
    }
    if (body.cron_expression && !CommonHelper.isValidCronExpression(body.cron_expression)) {
      next(
        new InvalidRequestParameter('cron expression is not valid', ['config'])
      , req, res);
    }
    const campaignRewardId = await CampaignRewardModel.addCampaignReward(body);
    this.sendResponse(req, res, 200, false, { id: campaignRewardId }, false);
};

CampaignController.scheduleCampaignReward = async function (req, res, next) {
    await CampaignService.schedule('reward');
    return res.sendStatus(200);
};

CampaignController.scheduleReward = async (req, res) => {
    await PollingService.pollAndScheduleData('reward');
    return res.sendStatus(200);
};

CampaignController.processReward = async (req, res) => {
    await ScheduleRewardService.assignPointsAndGenerateUniqueId();
    return res.sendStatus(200);
};

CampaignController.assignReward = async (req, res) => {
    await ScheduleRewardService.assignPointsInPms();
    return res.sendStatus(200);
};

CampaignController.enableCampaigns = async (req, res) => {
    const campaignIds = req.body.campaignIds;
    if (!campaignIds.length) {
        return res.sendStatus(200);
    }
    await CampaignModel.updateCampaignStatus(campaignIds, 0);
    return res.sendStatus(200);
};

CampaignController.disableCampaigns = async (req, res) => {
    const campaignIds = req.body.campaignIds;
    if (!campaignIds.length) {
        return res.sendStatus(200);
    }
    await CampaignModel.updateCampaignStatus(campaignIds, 1);
    return res.sendStatus(200);
};

CampaignController.scheduleCampaignApi = async function (req, res, next) {
  await CampaignService.schedule(CONSTANTS.CAMPAIGN_TYPE.API);
  return res.sendStatus(200);
};

CampaignController.scheduleApis = async (req, res) => {
  await PollingService.pollAndScheduleData(CONSTANTS.CAMPAIGN_TYPE.API);
  return res.sendStatus(200);
};

CampaignController.executeApis = async (req, res) => {
  await ScheduleApiService.executeApis();
  return res.sendStatus(200);
};

// add api campaign to campaing manager service
CampaignController.addCampaignApis = async function (req, res, next) {

    const body = req.body;

    let missing_parameters = new Array();
    if (!body.campaign_id) {
        missing_parameters.push('campaign_id');
    }
    if (!body.cron_expression) {
        missing_parameters.push('cron_expression');
    }
    if (!body.description) {
        missing_parameters.push('description');
    }
    if (missing_parameters.length > 0) {
        next(
            new MissingRequestParameter(
                'missing request parameters',
                missing_parameters
            ),
            req,
            res
        );
    }
    if (body.config && !CommonHelper.isJsonString(body.config)) {
        next(new InvalidRequestParameter('config should be json', ['config']), req, res);
    }
    if (!isConfigValidForApiCampaign(body.config)) {
        next(new InvalidRequestParameter('config is not valid', ['config']), req, res);
    }
    if (body.cron_expression && !CommonHelper.isValidCronExpression(body.cron_expression)) {
        next(
            new InvalidRequestParameter('cron expression is not valid', ['config'])
            , req, res);
    }

    try {
        const campaignApiId = await CampaignApiModel.addCampaignApi(body);
        this.sendResponse(req, res, 200, false, { id: campaignApiId }, false);
    } catch (error) {
        this.sendResponse(req, res, 500, false, false, error);
    }
};

const isConfigValidForApiCampaign = (config) => {
    try {
        if (!config) {
            console.error("Config is missing");
            return false;
        }

        // try to parse the config
        const parsedConfig = JSON.parse(config);

        // perform validations on parsedConfig
        const { path, method, headers, body, params } = parsedConfig;

        if (!path || !method || !headers) {
            console.error("Required fields (path, method, headers) are missing in config");
            return false;
        }

        const isValidMethod = CONSTANTS.REQUEST_METHODS.includes(method);
        if (!isValidMethod) {
            console.error(`Invalid method in config: ${method}`);
            return false;
        }

        // limitations of existing features
        if (!['GET', 'POST'].includes(method)) {
            console.error("Unsupported method");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Unable to parse and validate config:", error.message);
        return false;
    }
};

module.exports = CampaignController;
