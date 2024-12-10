//var express = require('express');
var path    = require('path');
var multer  = require('multer')
var router  = express.Router();

var awsHelper = require(HELPER_PATH+'AwsHelper');

// Require controller modules
const CampaignController = require('../app/campaign/controllers/CampaignController');
const RuleExpressionController = require('../app/campaign/controllers/RuleExpressionController');

var storage = multer.diskStorage({
//    destination: function (req, file, callback) {
//        callback(null, UPLOAD_PATH);
//    },
    filename: function (req, file, callback) { 
        var fileName = path.parse(file.originalname).name+'_'+Date.now()+path.parse(file.originalname).ext;
        callback(null, fileName);
    }
});

var storageWithDestination = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, UPLOAD_PATH);
    },
    filename: function (req, file, callback) { 
        var fileName = path.parse(file.originalname).name+'_'+Date.now()+path.parse(file.originalname).ext;
        callback(null, fileName);
    }
});

// ensure that auth is required for route
var ensureAuthenticated = function(req, res, next) {
    return next();
    //if (req.isAuthenticated()) { return next(); }
    //res.redirect('/user/login')
}  

var upload = multer({storage: storage })
var uploadWithDestination = multer({storage: storageWithDestination })

const workerTypeHandlers = new Map();
workerTypeHandlers.set(`${CONSTANTS.CAMPAIGN_TYPE.API}-${CONSTANTS.PROCESS_TYPE.SCHEDULE}`, (req, res, next) => CampaignController.scheduleCampaignApi(req, res, next));
workerTypeHandlers.set(`${CONSTANTS.CAMPAIGN_TYPE.API}-${CONSTANTS.PROCESS_TYPE.PROCESS}`, (req, res, next) => CampaignController.scheduleApis(req, res, next));
workerTypeHandlers.set(`${CONSTANTS.CAMPAIGN_TYPE.API}-${CONSTANTS.PROCESS_TYPE.EXECUTE}`, (req, res, next) => CampaignController.executeApis(req, res, next));

// APIS ===========================================================

// healthcheck
router.get('/', function (req, res) {	
    res.send({'status':true})
});

// get campaign
router.get('/campaign', function (req, res) {	
    CampaignController.getCampaign(req, res);
});

// create campaign
router.post('/campaign/add', function (req, res) {	
    CampaignController.addCampaign(req, res);
});

// update campaign
router.post('/campaign/update', function (req, res) {	
    CampaignController.updateCampaign(req, res);
});

// get campaign communication
router.get('/campaign/communication', function (req, res) {	
    CampaignController.getCampaignCommunication(req, res);
});

// add campaign communication
router.post('/campaign/add-campaign-communication', function (req, res) {	
    CampaignController.addCampaignCommunication(req, res);
});

// update campaign communication
router.post('/campaign/update-campaign-communication', function (req, res) {	
    CampaignController.updateCampaignCommunication(req, res);
});

// create rule expressions
router.post('/campaign/rules', (req, res) => {
  RuleExpressionController.upsertRuleExpression(req, res);
});

// create campaign reward
router.post('/campaign/v1/reward', (req, res, next) => {
  CampaignController.addCampaignRewards(req, res, next);
});

// create campaign api
router.post('/campaign/v1/api', (req, res, next) => {
  CampaignController.addCampaignApis(req, res, next);
});


router.get('/favicon.ico', function (req, res) {
  res.status(204).send();
});

// ON DEMAND WORKER APIs===========================================================

// communication workers
router.get('/campaign/schedule-campaign', function (req, res) {	
    CampaignController.scheduleCampaign(req, res);
});
router.get('/campaign/schedule-communication', function (req, res) {	
    CampaignController.scheduleCommunication(req, res);
});
router.get('/campaign/send-communication', function (req, res) {	
    CampaignController.sendCommunication(req, res);
});

// reward workers
router.get('/campaign/worker/reward', function (req, res, next) {
  console.log('in routes');
  CampaignController.scheduleCampaignReward(req, res, next);
});

router.get('/campaign/worker/reward/schedule', function (req, res) {
  CampaignController.scheduleReward(req, res);
});

router.get('/campaign/worker/reward/process', function (req, res) {
  CampaignController.processReward(req, res);
});

router.get('/campaign/worker/reward/send', function (req, res) {
  CampaignController.assignReward(req, res);
});

router.post('/campaign/enable', function (req, res) {
  CampaignController.enableCampaigns(req, res);
});

router.post('/campaign/disable', function (req, res) {
  CampaignController.disableCampaigns(req, res);
});

router.get('/campaign/worker-start/:workerType/:processType', function (req, res, next) {

  // Concatenate properties with '-'
  const workerKey = Object.values(req.params).join('-');

  // Use the map to get the corresponding handler function
  const handler = workerTypeHandlers.get(workerKey);

  // If the handler exists, call it else return 404.
  if (handler) {
    handler(req, res, next);
  } else {
    res.status(404).send('Worker Type not found');
  }
});


module.exports = router;
