const config = require('../app-configs/index')
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";
require('../../config/env')
let mongoose = require('../../src/backend/db/db')
let appConfig = require('./config');    
const ContentAggregation = require('./models/ContentAggregationModel');
const CompletionStatus = require('./CompletionStatus');

var contentMetadataSchema = new mongoose.Schema({
    id: String,
    content_type: String,
    content_title: String,
    content_thumbnail: String,
    content_link: String,
    products: [String],
    category: String,
    roles: [String],
    active: {type: Boolean,default: true},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
}, {collection: 'learning_module_content_status'}
);
  
var ContentMetadata = mongoose.model('contentMetadata', contentMetadataSchema);

ContentMetadata.addMetadata = function (content_type, content_title, content_thumbnail, content_link, products, category, roles) {
    return new Promise(function (resolve, reject) {
        var contentMetadata = new ContentMetadata();
        contentMetadata.content_type = content_type;
        contentMetadata.content_title = content_title;
        contentMetadata.content_thumbnail = content_thumbnail;
        contentMetadata.content_link = content_link;
        contentMetadata.products = products;
        contentMetadata.category = category;
        contentMetadata.roles = roles;
        contentMetadata.created_at = Date.now();
        contentMetadata.active = true;
        contentMetadata.save().then(function (result) {
            let sendresult = {"message":"Data added successfully","_id":result._id}
            resolve(sendresult);
        }).catch(function (e) {
            reject(e);
        })
    })
}

ContentMetadata.getAggregatedContent = function (product,role) {
    
    return new Promise(function (resolve, reject) {
        ContentMetadata.find({
          products: product,
          roles: role,
          active: { $not:{$eq: false }}
        }).sort({"updated_at": -1}).exec(async(err,result)=>{
            let videoCategory = await appConfig.getConfig();
            videoCategory = videoCategory.config.videoCategory;
            let data = {}
            for(let index in result){
                let item = result[index];
                if(!data.hasOwnProperty(item.category)){
                    data[item.category] = [{
                        "content_link":item.content_link,
                        "content_thumbnail":item.content_thumbnail,
                        "content_title":item.content_title,
                        "content_id":item._id
                    }]
                }
                else{
                    data[item.category].push({
                        "content_link" : item.content_link,
                        "content_thumbnail" : item.content_thumbnail,
                        "content_title" : item.content_title,
                        "content_id": item._id
                    })
                }
            }
            let videoCategoryCopy = [...videoCategory];
            let categories = Object.keys(data).sort();
            let temp = {};
            for (let i in videoCategory){
                var index = categories.indexOf(videoCategory[i]);
                if (index > -1) {
                  categories.splice(index, 1);
                }
                else{
                    let ind = videoCategoryCopy.indexOf(videoCategory[i]);
                    videoCategoryCopy.splice(ind, 1);
                }
            }
            videoCategoryCopy.push(...categories);
            for (var i = 0; i < videoCategoryCopy.length; i++) {
                temp[videoCategoryCopy[i]] = data[videoCategoryCopy[i]];
            }
            resolve(temp);
        })
    });
}

ContentMetadata.getContent = async function (req,res) {
    let findConditions = {};
    if(req.query.product){
        findConditions.product = req.query.product;
    }
    if(req.query.role){
        findConditions.role = req.query.role;
    }
    if (!req.query.mostWatchedVideos) {
    let result = await ContentMetadata.getAggregatedContent(findConditions.product,findConditions.role);
    return res.send(result);
    }
    if (req.query.userId) {
      findConditions.uuid = req.query.userId;
    }
    const content = await ContentMetadata.mostWatchedVideos(findConditions);
    
    return res.json({ content });
}

ContentMetadata.mostWatchedVideos = async function (queryParams) {
    let contentsRes = [];
    try {
      const userSpecificContent = [];
      const userSpecificContentIds = [];
      const userWatchedContentQuery = CompletionStatus.find(
        { uuid: queryParams.uuid },
        { content_id: 1 }
      );
      const aggregatedContentQuery = ContentAggregation.findOne({
        product: queryParams.product,
        category: "content",
      });
      
      const [userWatchedContent, mostWatchedContent] = await Promise.all([
        userWatchedContentQuery,
        aggregatedContentQuery,
      ]);

      const userWatchedContentIds = userWatchedContent.map(
        (content) => content.content_id
      );
      const aggregatedContent = mostWatchedContent ? mostWatchedContent.aggregatedArr : [];
      for (const content of aggregatedContent) {
        if (userSpecificContent.length >= 15) {
          break;
        }
        if (!userWatchedContentIds.includes(content._id.toString())) {
          userSpecificContentIds.push(content._id);
          userSpecificContent.push({
            content_link: content.content_link,
            content_thumbnail: content.content_thumbnail,
            content_title: content.content_title,
            content_id: content._id,
          });
        }
      }
  
      const remainingContentLen = 15 - userSpecificContent.length;
  
      contentsRes = userSpecificContent;
      if (remainingContentLen) {
        const recentlyUploadedContent = await ContentMetadata.find({
          _id: { $nin: userWatchedContentIds.concat(userSpecificContentIds) },
          active: true,
          products: queryParams.product,
          roles: queryParams.role,
        })
          .sort({ updated_at: -1 })
          .limit(remainingContentLen)
          .exec();
  
        for (const content of recentlyUploadedContent) {
          contentsRes.push({
            content_link: content.content_link,
            content_thumbnail: content.content_thumbnail,
            content_title: content.content_title,
            content_id: content._id,
          });
        }
      }
  
      return contentsRes;
    } catch (err) {
      console.error("error in get homepage content", err);
      return [];
    }
};

ContentMetadata.getMostWatchedContent = async function (req, res) {
    const query = req.query;
    const product = query.product || null;
    const role = query.role || null;
    try {
      const mostDownloadedContent = [];
      const today = new Date();
      today.setDate(today.getDate() - query.startDate);
      const aggregatedContent = await CompletionStatus.aggregate([
        {
          $match: {
            created_at: { $gte: today },
          },
        },
        {
          $group: { _id: "$content_id", count: { $sum: 1 } },
        },
        { $sort: { count: -1 } },
      ]).exec();
  
      const aggregatedContentIds = aggregatedContent.map((content) => content._id);
      const watchedContentInfo = await ContentMetadata.find({
        _id: { $in: aggregatedContentIds },
      }).exec();

      for (const contentId of aggregatedContentIds) {
        const contentDetails = watchedContentInfo.find((content) => content._doc._id.toString() === contentId);
  
        if (contentDetails && contentDetails.active) {
          let conditionsPassed = true;
          if (product && !contentDetails.products.includes(product)) {
            conditionsPassed = false;
          }
          if (role && !contentDetails.roles.includes(role)) {
            conditionsPassed = false;
          }
  
          if (conditionsPassed) {
            mostDownloadedContent.push(contentDetails);
          }
        }
      }
  
      const updateObj = {
        product,
        aggregatedArr: mostDownloadedContent,
        updatedAt: new Date(),
      };
      await ContentAggregation.findOneAndUpdate(
        { product, category: "content" },
        updateObj,
        {
          new: true,
          upsert: true,
        }   
      ).exec();
      console.log("Most Watched Content Length----->",{ message: "Success", contentLength: mostDownloadedContent.length })
      return res.json({ message: "Success", contentLength: mostDownloadedContent.length });
    } catch (err) {
      console.log("error in get most watched content", { product, err });
      return res.status(err.status || 500).json(err);
    }
};

ContentMetadata.test = function (req,res){
    return new Promise(function (resolve, reject) {
        let data = {
            'id': 'Data'
        }
        res.send(req.query)
    });
}

ContentMetadata.add = async function (req,res){
    //console.log('Resquest ',req.body)
    //console.log('Response ',res)
    let data = req.body;
    let count = await ContentMetadata.find({content_link:data.content_link,active: { $not:{$eq: false }}}).count();
    if(count > 0){
        //For Duplicate check
        res.status(500).send({
            code: 500,
            message: "Failure as you are trying to add duplicate Video"
          });
    }
    else{
        let response = await ContentMetadata.addMetadata(data.content_type, data.content_title, data.content_thumbnail, data.content_link, data.products, data.category, data.roles)
        res.send(response)
    }
}

ContentMetadata.getAllActiveCourses = function (req,res){
    return new Promise(function (resolve, reject){
        ContentMetadata.find({active: { $not:{$eq: false }}}).sort({"updated_at": -1,"category":1}).exec(async(err,result)=>{
            if(err){
                res.send({status:400,error:err});
            }
            let videoCategory = await appConfig.getConfig();
            videoCategory = videoCategory.config.videoCategory;
            let data = {}
            for(let index in result){
                let item = result[index];
                if(!data.hasOwnProperty(item.category)){
                    data[item.category] = [{
                        "content_link":item.content_link,
                        "content_thumbnail":item.content_thumbnail,
                        "content_title":item.content_title,
                        "content_id":item._id,
                        "category":item.category
                    }]
                }
                else{
                    data[item.category].push({
                        "content_link" : item.content_link,
                        "content_thumbnail" : item.content_thumbnail,
                        "content_title" : item.content_title,
                        "content_id": item._id,
                        "category":item.category
                    })
                }
            }
            let videoCategoryCopy = [...videoCategory];
            let categories = Object.keys(data).sort();
            let temp = {};
            for (let i in videoCategory){
                var index = categories.indexOf(videoCategory[i]);
                if (index > -1) {
                  categories.splice(index, 1);
                }
                else{
                    let ind = videoCategoryCopy.indexOf(videoCategory[i]);
                    videoCategoryCopy.splice(ind, 1);
                }
            }
            videoCategoryCopy.push(...categories);
            for (var i = 0; i < videoCategoryCopy.length; i++) {
                temp[videoCategoryCopy[i]] = data[videoCategoryCopy[i]];
            }
            console.log("All Active Courses response----->",temp)
            res.send(temp);
        })
    })
}

ContentMetadata.softDeleteCourses = function (req,res){
    //console.log(req.body)
    return new Promise(function(resolve,reject){
        ContentMetadata.findOneAndUpdate({_id : req.body.id},{active: req.body.active}).then((result)=>{
            console.log(result)
            res.send({status:200,message:`Successfully deleted the Video with id ${result._id}`})
        })
    })
}

ContentMetadata.editCourse = function (req,res){
    console.log(req.body)
    return new Promise(function(resolve,reject){
        ContentMetadata.findOneAndUpdate({_id : req.body.id},{
            content_title: req.body.content_title,
            content_thumbnail:req.body.content_thumbnail,
            content_link : req.body.content_link,
            category : req.body.category,
            updated_at : new Date()
        }).then((result)=>{
            //console.log(result)
            res.send({status:200,message:`Successfully Updated the Video with id ${result._id}`})
        })
    })
}

module.exports = ContentMetadata;

{/* 

console.log(result)
            if(err)
                reject(err);
            let query = ContentMetadata.aggregate([
                {
                    "$group":{
                        _id:"$content_title",
                    }
                }
            ])
            console.log(query)
            query.exec((err,titleName)=>{
                if(err)
                    reject(err);
                else{
                    let data = [];
                    console.log('titleName',result)
                    for(let item in titleName){
                        let content_link = [];
                        let content_thumbnail = [];
                        for(let item1 in result){
                            if (result[item1].content_title == titleName[item]['_id']){
                                content_link.push(result[item1].content_link);
                                content_thumbnail.push(result[item1].content_thumbnail)
                            }
                        }
                        data.push({
                            'content_title':titleName[item]['_id'],
                            'content_link':content_link,
                            'content_thumbnail':content_thumbnail
                        })

                    }
                    resolve(data)
                }
            })
         */}
