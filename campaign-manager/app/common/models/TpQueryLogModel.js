var tpQueryLogSchema = new mongoose.Schema({
    query           : String,
    request_data    : Object,
    response_data   : Object,
    created_at      : {type: Date},
    updated_at      : {type: Date}
    },{collection:'tp_query_log'}
);

var TpQueryLog = mongoose.model('TpQueryLog', tpQueryLogSchema);

TpQueryLog.addQueryLog = function(query, requestData, responseData){
    return new Promise(function(resolve, reject) {
        var queryLog  = new TpQueryLog();
        queryLog.query          = query;
        queryLog.request_data = requestData;
        queryLog.response_data= responseData;
        queryLog.created_at   = Date.now();
        queryLog.saveAsync().then(function(result){
            resolve(result._id);
        }).catch(function(e){
            reject(e);
        });
    });
};

TpQueryLog.updateQueryLog = function(logId, response){
    return new Promise(function(resolve, reject) {
        let updatedAt = Date.now();
        TpQueryLog.findByIdAndUpdateAsync(logId,{response_data:response, updated_at: updatedAt}).then(function(docs){
            resolve(docs._id);
        }).catch(function(e){
            reject(e);
        });
    });
}    
module.exports = TpQueryLog;
