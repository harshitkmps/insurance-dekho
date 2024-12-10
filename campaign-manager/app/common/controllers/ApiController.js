var commonHelper    = require(HELPER_PATH+'CommonHelper');
var errorHelper    = require(HELPER_PATH+'ErrorHelper');

class ApiController{
    
    constructor() {
        
    }
    
}

ApiController.sendSuccessResponse = function(req, res, data = false){
    commonHelper.sendSuccessResponse(req, res, data);
}

ApiController.sendErrorResponse = function(req, res, errors = false){
    commonHelper.sendErrorResponse(req, res, errors);
}

ApiController.sendResponse = function(req, res, status, message, data, errors){
    commonHelper.sendResponse(req, res, status, message, data, errors);
}

ApiController.formatError = function(errorCode, errorFieldName){
    let error = errorHelper.formatError(errorCode, errorFieldName);
    return error;
}
    
module.exports = ApiController;
