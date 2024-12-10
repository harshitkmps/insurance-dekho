var ApiController   = require('./ApiController');
var commonModel     = require('../models/CommonModel');
var commonHelper    = require(HELPER_PATH+'CommonHelper');
var redisHelper     = require(HELPER_PATH+'RedisHelper');

class CommonController extends ApiController{
    constructor() {
        super();
    }
}

CommonController.getCity = async function(req, res){
    var query = {};
    req.elk.module      = 'Common';
    req.elk.sub_module  = 'getCity'; 

    query.fetchData = 'city';

    if(req.query.cityId){
        query.cityId = req.query.cityId;
    }
    if(req.query.stateId){
        query.stateId = req.query.stateId;
    }
    if(req.query.cityName){
        query.cityName = req.query.cityName;
    }
    if(req.query.tags){
        query.tags = req.query.tags;
    }
    query.source    = config.source.autodb;
    query.subSource = config.subSource.vahanScrapper;
    
    try{
        let cities = await redisHelper.getJSON('cities');
        if(!cities){
            let result = await commonHelper.sendGetRequestToBrokerage(query, '/api/v1/motor/getBkgMasterData');
            cities = await redisHelper.setJSON('cities',result);     
            this.sendResponse(req, res, 200, false, result, false);                      
        }else{
            req.cached = true;
            this.sendResponse(req, res, 200, false, cities, false);
        }
    }catch(e){
        this.sendResponse(req, res, 400, false, false, e);
    }
}

CommonController.getRtoDetail = async function(req, res){
    req.elk.module      = 'Common';
    req.elk.sub_module  = 'getRtoDetail'; 

    try{ 
        let result = await commonModel.getRtoDetail(req.query);
        this.sendSuccessResponse(req, res, result);    
    }catch(e){
        this.sendErrorResponse(req, res, e);
    }
}
    
CommonController.getMappedData = async function(req, res){
    var query = {};
    var errors = new Array();
    req.elk.module      = 'Common';
    req.elk.sub_module  = 'getMappedData'; 

    if(req.query.insurerId){
        query.insurerId = req.query.insurerId;
    }else{
        error = this.formatError('ERR10001', 'insurerId');
        errors.push(error);
    }
    if(req.query.data){
        query.data = req.query.data;
    }else{
        error = this.formatError('ERR10002', 'data');
        errors.push(error);
    }
    if(req.query.tags){
        query.tags = req.query.tags;
    }else{
        error = this.formatError('ERR10003', 'tags');
        errors.push(error);
    }
    
    query.source    = config.source.autodb;
    query.subSource = config.subSource.vahanScrapper;
    
    try{
        let result = await commonHelper.sendGetRequestToBrokerage(query, '/api/v1/motor/mappedMasterData');
        this.sendResponse(req, res, 200, false, result, false);
    }catch(e){
        this.sendResponse(req, res, 400, false, false, e);
    }     
}
    
CommonController.sendRequestToBrokerage = async function(req, res){
    if(req.method == 'GET'){         
        req.query.source    = config.source.autodb;
        req.query.subSource = config.subSource.vahanScrapper;

        if(req.query.fetchData && req.query.fetchData=='all_make'){
            this.getAllMakes(req, res);
        }else{
            try{
                let result = await commonHelper.sendGetRequestToBrokerage(req.query, req.path);
                this.sendResponse(req, res, 200, false, result, false);                  
            }catch(e){
                this.sendResponse(req, res, 400, false, false, e);
            }     
        }
    }
    if(req.method == 'POST'){
        req.body.source    = req.body.source?req.body.source:config.source.b2c.toLowerCase();
        req.body.subSource = req.body.sub_source?req.body.sub_source:config.subSource.insuranceDekho;

        var options = {
                    host: config.insuranceBrokerage.host,
                    path: req.originalUrl
                }; 
        if(req.headers && (req.headers['Content-Type'] || req.headers['content-type'])){
            options.headers = {};
            if(req.headers['content-type']){
                options.headers['Content-Type'] = req.headers['content-type']; 
            }else{
                options.headers['Content-Type'] = req.headers['Content-Type']; 
            }
        }    

        try{
            let result = await commonHelper.sendPostRequest(req.body, options);
            if(result.data){
                this.sendResponse(req, res, 200, false, result.data, false);
            }else if(result.errors){
                throw result.errors;                       
            }else{
                throw ERROR.DEFAULT_ERROR;                        
            }                     
        }catch(e){
            this.sendResponse(req, res, 400, false, false, e);
        }     
    }           
}

CommonController.getCarMake = async function(req, res){ 
    req.elk.module      = 'Common';
    req.elk.sub_module  = 'getCarMake'; 
    try{ 
        let result = await commonModel.getCarMake();
        this.sendSuccessResponse(req, res, result);    
    }catch(e){
        this.sendErrorResponse(req, res, e);
    }
}

CommonController.getCarModel = async function(req, res){ 
    let errors = new Array();
    req.elk.module      = 'Common';
    req.elk.sub_module  = 'getCarModel'; 
    if(!req.query.make_id){
        error = this.formatError('ERR10008', 'make_id');
        errors.push(error);
    }
    try{
        if(!errors.length){
            let result = await commonModel.getCarModel(req.query.make_id);
            this.sendSuccessResponse(req, res, result);
        }else{
            throw errors;
        }
    }catch(e){
        this.sendErrorResponse(req, res, e);
    }
}

CommonController.getCarVariant = async function(req, res){ 
    let errors = new Array();
    req.elk.module      = 'Common';
    req.elk.sub_module  = 'getCarVariant'; 
    
    if(!req.query.model_id){
        error = this.formatError('ERR10009', 'model_id');
        errors.push(error);
    }
    try{
        if(!errors.length){
            let result = await commonModel.getCarVariant(req.query.model_id);
            this.sendSuccessResponse(req, res, result);
        }else{
            throw errors;
        }
    }catch(e){
        this.sendErrorResponse(req, res, e);
    }
}

CommonController.getBikeMake = async function(req, res){ 
    req.elk.module      = 'Common';
    req.elk.sub_module  = 'getBikeMake'; 
    
    try{
        let result = await commonModel.getBikeMake();
        this.sendSuccessResponse(req, res, result);    
    }catch(e){
        this.sendErrorResponse(req, res, e);
    }
}

CommonController.getBikeModel = async function(req, res){ 
    let errors = new Array();
    req.elk.module      = 'Common';
    req.elk.sub_module  = 'getBikeModel'; 
    
    if(!req.query.make_id){
        error = this.formatError('ERR10008', 'make_id');
        errors.push(error);
    }
    try{
        if(!errors.length){
            let result = await commonModel.getBikeModel(req.query.make_id);
            this.sendSuccessResponse(req, res, result);   
        }else{
            throw errors;
        }
    }catch(e){
        this.sendErrorResponse(req, res, e);
    }
}

CommonController.getBikeVariant = async function(req, res){ 
    let errors = new Array();
    req.elk.module      = 'Common';
    req.elk.sub_module  = 'getBikeVariant'; 
    
    if(!req.query.model_id){
        error = this.formatError('ERR10009', 'model_id');
        errors.push(error);
    }
    try{
        if(!errors.length){
            let result = await commonModel.getBikeVariant(req.query.model_id);
            this.sendSuccessResponse(req, res, result); 
        }else{
            throw errors;
        }
    }catch(e){
        this.sendErrorResponse(req, res, e);
    }
}

module.exports = CommonController;
