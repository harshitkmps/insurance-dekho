
var errorApiLogSchema = new mongoose.Schema({
    url             : String,
    request_type    : String,
    request_data    : Object,
    response_data   : Object,
    user_ip         : String,
    user_agent      : String,   
    user_device     : String,
    created_at      : {type: Date},
    updated_at      : {type: Date, default: Date.now}
    },{collection:'error_api_log'}
);

var ErrorApiLog = mongoose.model('errorApiLog', errorApiLogSchema);

ErrorApiLog.addErrorApiLog = function(url, requestType, requestData, responseData, userIp, userAgent, userDevice){
    return new Promise(function(resolve, reject) {
        var errorApiLog  = new ErrorApiLog();
        errorApiLog.url  = url;
        errorApiLog.request_type = requestType;
        errorApiLog.request_data = requestData;
        errorApiLog.response_data= responseData;
        errorApiLog.user_ip      = userIp;
        errorApiLog.user_agent   = userAgent;
        errorApiLog.user_device  = userDevice;
        errorApiLog.created_at   = Date.now();
        errorApiLog.save().then(function (result) {
            resolve(result._id)
        }).catch(function(e){
            reject(e);
        });
    });
}

ErrorApiLog.updateErrorApiLog = function(logId, response){
    return new Promise(function(resolve, reject) {
        ErrorApiLog.findByIdAndUpdateAsync(logId,{response_data:response}).then(function(docs){
            resolve(docs._id);
        }).catch(function(e){
            reject(e);
        });
    });
}    
module.exports = ErrorApiLog;
