const config = require('../app-configs/index')
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";
require('../../config/env')

let mongoose = require('../../src/backend/db/db')

var completionStatusSchema = new mongoose.Schema({
    content_id: String,
    uuid: String,
    status: String,
    percentageCompleted: Number,
    videoDuration:Number,
    start_time: {type: Date, default: Date.now},
    end_time: {type: Date, default: Date.now},
    created_at: {type: Date, default: Date.now},
}, {collection: 'learning_module_completion_status'}
);

var CompletionStatus = mongoose.model('completionStatus', completionStatusSchema);

CompletionStatus.addCompletionStatus = function (content_id,uuid,status,videoPercentage,videoDuration) {
    return new Promise(function (resolve, reject) {
        
        CompletionStatus.count({content_id:content_id,uuid:uuid}).exec(function(err,count){
            if(err){
                reject(err)
            }
            else{
                if(count == 0){
                    //New Entry
                    var completionStatus = new CompletionStatus();
                    completionStatus.content_id = content_id;
                    completionStatus.uuid = uuid;
                    completionStatus.status = status;
                    completionStatus.percentageCompleted = videoPercentage;
                    completionStatus.videoDuration = videoDuration;
                    completionStatus.start_time = Date.now();
                    completionStatus.end_time = Date.now();
                    completionStatus.created_at = Date.now();
                    completionStatus.save().then(function (result) {
                        let sendresult = {"message":"Status added successfully","_id":result._id}
                        resolve(sendresult);
                    }).catch(function (e) {
                        reject(e);
                    })
                }
                else{
                    //Need the Update entry here
                    CompletionStatus.find({content_id:content_id,uuid:uuid}).then((item)=>{
                        if(videoPercentage > item[0].percentageCompleted){
                            CompletionStatus.findOneAndUpdate({content_id:content_id,uuid:uuid},{status:status,percentageCompleted:videoPercentage}).then(function (docs) {
                                let response = {'message':"Status Updated Successfully",'id':docs._id,'content_id':content_id};
                                console.log("Update status is",docs)
                                resolve(response);
                            }).catch(function (e) {
                                reject(e);
                            });
                        }
                        else{
                            let response = {'message':"Status Updated Successfully",'content_id':content_id};
                            resolve(response);
                        }
                    })
                }
            }
        })
        
    })
}

CompletionStatus.getCompletionStatus = function (req,res) {
    let findConditions = {};
    if(req.params.uuid){
        findConditions.uuid = req.params.uuid;
    }
    
    return new Promise(function (resolve, reject) {
        CompletionStatus.find({uuid:findConditions.uuid}).then(function (docs) {
            //console.log(docs)
            let count = 0;
            docs.forEach((item)=>{
                if(item.status == "COMPLETED")
                    count++;
            })
            res.send({videosCompleted:count,data:docs})
        }).catch(function (e) {
            res.send(e);
        });
    });
}

CompletionStatus.updateStatus = async function (req,res){
    //console.log('Resquest ',req.body)
    //console.log('Response ',res)
    let data = req.params;
    console.log(133,req.body.videoDuration)
    let response = await CompletionStatus.addCompletionStatus(data.content_id,data.uuid,req.body.status,req.body.videoPercentage,req.body.videoDuration)
    res.send(response)
}
module.exports = CompletionStatus;