var AWS     = require('aws-sdk');
var fs      = require('fs');
var path    = require('path');
var async   = require('async');

AWS.config.loadFromPath(CONFIG_PATH+'aws_s3.json');

var s3 = new AWS.S3({signatureVersion: 'v4'});

module.exports = {
    
    uploadFile: function(params, callback){
        if(config.aws.s3.enabled){
            var uploadParams= {Bucket: config.aws.s3.bucketName, Key: params.fileName, Body: ''};
            var fileStream  = fs.createReadStream(params.filePath);
            fileStream.on('error', function(err) {
                console.log('File Error', err);
            });
            uploadParams.Body = fileStream;
            if(params.tagging){
                uploadParams.Tagging= params.tagging;
            }

            s3.upload (uploadParams, function (err, data) {
                if(err){
                    console.log("Error", err);
                    return callback(err);
                } 
                if(data){
                    console.log("Upload Success", data.key);
                    return callback(null, data.key);            
                }
            });   
        }else{
            var dir     = path.basename(path.dirname(params.fileName));
            var fileName= path.basename(params.fileName);
            var writeFilePath = UPLOAD_PATH+'/'+fileName;

            if(dir !== UPLOAD_DIR){
                writeFilePath = UPLOAD_PATH+dir+'/'+fileName;
                fs.existsSync(UPLOAD_PATH+dir) || fs.mkdirSync(UPLOAD_PATH+dir);
            }

            var readStream  = fs.createReadStream(params.filePath);
            var writeStream = fs.createWriteStream(writeFilePath);

            readStream.pipe(writeStream);

            readStream.on('error', function(){
                return callback('Error in reading file.');
            });
            writeStream.on('error', function(){
                return callback('Error in reading file.');
            });

            readStream.on('close', function () {
                return callback(null, params.fileName);
            });
        }
    },

    uploadFiles: function(files, folderName, callback){
        var uploadedFiles = new Array();
        folderName = folderName?folderName:UPLOAD_DIR;
        if(files){
            async.each(files,
                function(file, cb){ 
                    var params = {filePath:file.path, fileName:folderName+'/'+file.filename};
                    this.uploadFile(params, function(err, fileName){
                        if(!err){
                            uploadedFiles.push(fileName);
                            cb();
                        }else{
                            return callback(err);
                        }
                    });
                },
                function(err){
                    if(!err){
                        return callback(null, uploadedFiles);
                    }else{
                        return callback(err);
                    }
                }
            );
        }else{
            return callback('Files are required to upload.')
        }
    },

    readFile: function(req, res){
        var fileName = req.params.registrationNumber+'/'+req.params.fileName
        var params= {Bucket: config.aws.s3.bucketName, Key: fileName};
        s3.getObject(params, function(err, data) {
            if (err){
                console.log(err);
            }
            res.write(data.Body);
            res.end();
        });
    }
}