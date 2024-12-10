var errorLogSchema = new mongoose.Schema({
    method           : String,
    error           : Object,
    created_at      : {type: Date},
    updated_at      : {type: Date}
    },{collection:'error_log'}
);

var ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

ErrorLog.addErrorLog = function(method, errorData){
    return new Promise(function(resolve, reject) {
        var queryLog  = new ErrorLog();
        queryLog.method          = method;
        queryLog.error  = errorData;
        queryLog.created_at   = Date.now();
        queryLog.saveAsync().then(function(result){
            resolve(result._id);
        }).catch(function(e){
            reject(e);
        });
    });
};

ErrorLog.updateErrorLog = function(logId, error){
    return new Promise(function(resolve, reject) {
        let updatedAt = Date.now();
        ErrorLog.findByIdAndUpdateAsync(logId,{error:error, updated_at: updatedAt}).then(function(docs){
            resolve(docs._id);
        }).catch(function(e){
            reject(e);
        });
    });
}    
module.exports = ErrorLog;
