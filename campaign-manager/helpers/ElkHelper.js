var fs      = require('fs');
var rfs     = require('rotating-file-stream');
var async   = require('async');
var moment  = require('moment');
var exec    = require('child_process').exec;

rfs('vahan_scrapper.json', {
    size: '100M',
    maxFiles: 5,
    history: LOG_PATH+'rotate_history.txt',
    path: LOG_PATH
});

module.exports = {

    log: function(request, response, errorType){
        if(errorType == 1){
            request.elk.level = 0;
            request.elk.http_code = 200;
            request.elk.status_code = 'Success';
        } else if(errorType == 2){
            request.elk.level = 3;
            request.elk.http_code = 400;
            request.elk.status_code = 'Validation Error';
        } else if(errorType == 3){
            request.elk.level = 5;
            request.elk.http_code = 500;
            request.elk.status_code = 'Code Error';
        }

        var currentTime     = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
        var currentTimeStamp= moment(currentTime).format('x');
        var requestTimeStamp= moment(request.elk.requestTime).format('x');
        var processTime = (currentTimeStamp - requestTimeStamp)/1000;
        var cmd         = 'git rev-parse HEAD';
        var requestData = {};

        exec(cmd, function(error, stdOut, stdErr) {
            var count       = 1;
            var responseData= {};
            var revisionId  = stdOut;
            if(response){
                responseData['f'+1] = response.status ? "status:"+response.status : '';      
                responseData['f'+2] = response.message ? "message:"+response.message : '';
                if(Array.isArray(response.data)){
                    responseData['f'+3] = response.data ? "data:'"+ JSON.stringify(response.data) : '';
                }else{
                    responseData['f'+3] = response.data ? "data:'"+ objToString(response.data) : '';
                }    
                for(var i=4; i<=10; i++){
                    responseData['f'+i] = '';
                }
            }
            async.forEachOf(request.body, function (val, key, callback) {
                requestData['f'+count] = key+":"+val;
                count++;
                callback();
                }, function (k) {
                   count--;
                   for(var i=count; i<=10; i++){
                        requestData['f'+i] = '';
                    }
                var writeData = {
                    app_group: 'B2CAPI',
                    app_name: 'WEB',   
                    revision_id: revisionId ,
                    log_time: currentTime,
                    url: request.headers.host+request.url,
                    module: request.elk.module,
                    sub_module: request.elk.sub_module,
                    request_type: request.method,
                    ref_id: 0,
                    http_code: request.elk.http_code,
                    status_code: request.elk.status_code,
                    level: request.elk.level,
                    request_data_raw: JSON.stringify(request.body),
                    request_data: requestData,
                    response_data_raw: JSON.stringify(response),
                    response_data: responseData,
                    response_time: currentTime,
                    process_time:  processTime
                };

                fs.appendFile(ELK_FILE_PATH, JSON.stringify(writeData)+'\r\n',{ flag: 'a+' }, function(err) {
                    if(err) {
                        console.log(err);
                    }
                }); 
            });
        });
    },

    objToString: function(obj) {
        var str = '{';
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str += p + ':' + obj[p] + ',';
            }
        }
        str += '}'
        return str;
    }
    
}