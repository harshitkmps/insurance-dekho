
var apiLogSchema = new mongoose.Schema({
    url             : String,
    request_type    : String,
    request_data    : Object,
    response_data   : Object,
    user_ip         : String,
    user_agent      : String,   
    user_device     : String,
    created_at      : {type: Date},
    updated_at      : {type: Date}
    },{collection:'api_log'}
);

var ApiLog = mongoose.model('ApiLog', apiLogSchema);

ApiLog.addApiLog = function(url, requestType, requestData, responseData, userIp, userAgent, userDevice){
    return new Promise(function(resolve, reject) {
        var apiLog  = new ApiLog();
        apiLog.url          = url;
        apiLog.request_type = requestType;
        apiLog.request_data = requestData;
        apiLog.response_data= responseData;
        apiLog.user_ip      = userIp;
        apiLog.user_agent   = userAgent;
        apiLog.user_device  = userDevice;
        apiLog.created_at   = Date.now();
        apiLog.saveAsync().then(function(result){
            resolve(result._id);
        }).catch(function(e){
            reject(e);
        });
    });
}

ApiLog.updateApiLog = function(logId, response){
    return new Promise(function(resolve, reject) {
        let updatedAt = Date.now();
        ApiLog.findByIdAndUpdateAsync(logId,{response_data:response, updated_at: updatedAt}).then(function(docs){
            resolve(docs._id);
        }).catch(function(e){
            reject(e);
        });
    });
}    
module.exports = ApiLog;
