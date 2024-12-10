const config = require('../app-configs/index')
const isUrl = require("is-url");
const { parser, convertToLink} = require("./helper/GamificationHelper");
var Path = require("path");
const Fs = require("fs");
const queryString = require("query-string");
const axios = require("axios");
const AWS = require("aws-sdk");
require('../../config/env')
let appConfig = require('./config');

let mongoose = require('../../src/backend/db/db');
const ContentAggregation = require('./models/ContentAggregationModel');

const ID = process.env.ID;
const SECRET = process.env.SECRET;
const BUCKET_NAME = process.env.BUCKET_NAME;
AWS.config.update({
  accessKeyId: ID,
  secretAccessKey: SECRET,
  region: process.env.region,
});
var s3 = new AWS.S3({ signatureVersion: "v4" });

var gamificationSchema = new mongoose.Schema({
    vizardUrl: {type: String,required: true},
    imageUrl: {type: String,required: true},
    product: {type: String,default: "POS",required: true},
    createdOn: {type: Date,required: true,default: Date.now},
    updatedOn: {type: Date,required: true},
    editableList: {type: [{}]},
    user: {type: String,required: true},
    active: {type: Boolean,default: true},
    tags: {type: [String]},
    category: {type: String},
    description: {type: String},
  }, {collection: 'promotional_banner_module_gamification'}
);

var bannerAuditSchema = new mongoose.Schema({
  user_id : String,
  user_name :String,
  email : String,
  mobile : String,
  banner_id: String,
  tags: {type: String,default: 'default'},
  banner_category: String,
  gcd_code : String,
  uuid: String,
  source: {type: String,default: "POS"},
  editableList: {type: [{}]},
  createdOn: {type: Date,required: true,default: Date.now},
  updatedOn: {type: Date,required: true,default: Date.now},
}, {collection: 'promotional_banner_audit'}
);

async function downloadImage(url, filename) {
    const path = Path.resolve(__dirname, filename);
    const writer = Fs.createWriteStream(path);

    const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

var BannerAudit = mongoose.model('bannerAudit', bannerAuditSchema);

async function trackCustomBannerAudit(object){
  setTimeout(()=>{
    const newLog = new BannerAudit(object)
    newLog.save().then((result)=>{
      console.log('Custom banner logs added with id',result._id);
    }).catch(function(e){
      console.log("Error occurs in adding custom banner logs ",e)
    })
  },10);
}

var Gamification = mongoose.model('gamification', gamificationSchema);

Gamification.addBanner = async function (req,res) {
    try {
        const vizardUrl = req.body.vizardUrl;
        const active = req.body.active;
        const tags = req.body.tags;
        var product = "POS";
        var category = req.body.category;
        const description = req.body.description;
        const userId = req.body.userId;
        const editableFields = parser(vizardUrl);
        const updatedOn = new Date();
        let count = await Gamification.find({vizardUrl:req.body.vizardUrl,active:true}).count()
        if(count > 0){
          return res.status(500).send({
            code: 500,
            message: "Failure as you are trying to add duplicate Banner"
          });
        }
        if (isUrl(vizardUrl) === false) {
          res.status(400).send({
            code: 400,
            message: "Invalid URL Format!",
            result: "Failure",
          });
        }
        if (typeof active !== typeof true) {
          res.status(400).send({
            code: 400,
            message: "Invalid Active Status",
            result: "Failure",
          });
        }
        if (req.body.product !== undefined) {
          product = req.body.product;
        }
        var imageUrl;
        const filename = `${parseInt(Math.random() * 10000000)}.jpg`;
        await downloadImage(vizardUrl, filename);
        const Key = `${process.env.AWS_PREFIX}/dev/banners/templates/${filename}`;
        const path = Path.resolve(__dirname, filename);
        await Fs.readFile(path, (err, data) => {
          if (err) throw err;
          Fs.unlink(path,(err)=>{
              if(err)
                console.log(135,err)
          });
          const params = {
            Bucket: BUCKET_NAME, // pass your bucket name
            Body: data,
            Key: Key,
            ContentType: "image/jpeg",
            ContentDisposition: "attachment"
          };
          s3.upload(params, async function (err, data) {
            if (err) {
              return err;
            }
            const newObj = new Gamification({
              vizardUrl: vizardUrl,
              imageUrl: data.Location,
              product: product,
              updatedOn: updatedOn,
              editableList: editableFields,
              user: userId,
              tags: tags,
              active: active,
              description: description,
              category: category,
            });
            await newObj.save((err) => {
              if (err) {
                return res.status(500).send({
                  code: 500,
                  message: "Unable to upload data to server.",
                  result: "Failure",
                });
              } else {
                return res.status(200).send({
                  code: 200,
                  message: "Banner added Successfully",
                  result: imageUrl,
                });
              }
            });
          });
        });
        // console.log("here",imageUrl);
      } catch (err) {
        return res.status(500).send({
          code: 500,
          message: "Unable to upload data to server.",
          result: err,
        });
      }
}

Gamification.getPaginatedBanner = function (req, res){
    return new Promise(async function (resolve, reject) {
        if (req.query && req.query.mostDownloadedContent) {
          const product = req.query.product;
          const banners = { results: [] };
          const aggregatedBanners = await ContentAggregation.findOne(
            { product, category: "banners" }, 
            { _id: 0, aggregatedArr: 1 }
          );
          banners.results = aggregatedBanners ? aggregatedBanners.aggregatedArr : [];
          return res.send(banners);
        } else {
        let currentPage = 1;
        let pageSize = 20;
        var category = req.query.category;
        var query = {};
        if (category !== undefined) {
            query["category"] = category;
        }
        query['active']=true;
        if (req.query.currentPage !== undefined) {
            currentPage = parseInt(req.query.currentPage);
        }
        if (req.query.pageSize !== undefined) {
            pageSize = parseInt(req.query.pageSize);
        }
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = currentPage * pageSize;
        let nextPage = currentPage;
        let previousPage = currentPage;
        let results = {};
        var cnt = await Gamification.find(query).count().exec();
        if (endIndex < cnt) {
            nextPage = currentPage + 1;
        }
        if (startIndex > 0) {
            previousPage = currentPage - 1;
        }
        var previousObj = {
            pageSize: pageSize,
            currentPage: previousPage,
        };
        var nextObj = {
            pageSize: pageSize,
            currentPage: nextPage,
        };
        if (category !== undefined) {
            previousObj["category"] = category;
            nextObj["category"] = category;
        }
        //pass filter to link as well
        results.paginatation = {
            totalRecords: cnt,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: Math.ceil(cnt / pageSize),
            previous: "/banners?" + queryString.stringify(previousObj),
            next: "/banners?" + queryString.stringify(nextObj),
        };
        let categoryQuery = Gamification.aggregate([
          { $match: { active: true } },
          {
              "$group":{
                  _id:"$category",
              }
          }
        ])
        //console.log(categoryQuery)
        try {
          categoryQuery.exec(async (err,categoryList)=> {
            if(err)
              throw err;
            else{
              //console.log(categoryList)
              categoryList = categoryList.map((item)=>item._id);
              let categories = categoryList.sort();
              let bannerCategory = await appConfig.getConfig();
              bannerCategory = bannerCategory.config.bannerCategory;
              let bannerCategoryCopy = [...bannerCategory];
              for (let i in bannerCategory){
                let index = categories.indexOf(bannerCategory[i]);
                if (index > -1) {
                  categories.splice(index, 1);
                }
                else{
                  let ind = bannerCategoryCopy.indexOf(bannerCategory[i]);
                  bannerCategoryCopy.splice(ind, 1);
                }
              }
              bannerCategoryCopy.push(...categories);
              results.category = bannerCategoryCopy;
              results.results = await Gamification
                .find(query, { vizardUrl: 0 })
                .sort({'updatedOn':-1})
                .limit(pageSize)
                .skip(startIndex)
                .exec();
                res.status(200).send(results)
                }
          });
        } catch (err) {
            res.status(500).send({code: 500,message: "Pagination Failed!",result: err});
        }
        }
    });
}

Gamification.getCustomBanner = function (req, res){
    return new Promise(async function (resolve, reject) {
        let filename;
        try {
            const imageId = req.body.imageId;
            const editableList = req.body.editableList;          
            trackCustomBannerAudit({
              banner_id:imageId,
              editableList:editableList,
              user_id:req.body.user_id ? req.body.user_id : "",
              user_name:req.body.user_name ? req.body.user_name : "",
              email:req.body.email ? req.body.email : "",
              mobile:req.body.mobile ? req.body.mobile : "",
              banner_category:req.body.banner_category ? req.body.banner_category : "",
              gcd_code:req.body.gcd_code ? req.body.gcd_code : "",
              source:req.body.source ? req.body.source :"POS",
              tags : req.body.tags ? req.body.tags : "default",
              uuid: req.body.uuid ? req.body.uuid : "",
            });
            var result = await Gamification.find({ _id: imageId });
            var vizardUrl = result[0].vizardUrl;
            var link = convertToLink(editableList, vizardUrl);
            filename = `${parseInt(Math.random() * 10000000)}.jpg`;
            await downloadImage(link, filename);
            const Key = `${process.env.AWS_TEMP_DIR}/dev/banners/actuals/${filename}`;
            const path = Path.resolve(__dirname, filename);
            await Fs.readFile(path, (err, data) => {
              if (err) throw err;
              Fs.unlink(path,(err)=>{
                  if(err)
                    console.log(264,err)
              });
              const params = {
                Bucket: BUCKET_NAME, // pass your bucket name
                Body: data,
                Key: Key,
                ContentType: "image/jpeg",
                ContentDisposition: "attachment"
              };
              s3.upload(params, function (err, data) {
                if (err) {
                  return err;
                }
                res.status(200).send({code: 200,message: "Success",result: data.Location});
              });
            });
          } 
        catch (err) {
            const path = Path.resolve(__dirname, filename);
            Fs.unlink(path,(err)=>{
              if(err)
                console.log(264,err)
            });
            res.status(500).send({code: 500,message: "Something went Wrong",result: err});
        }
    })
}

Gamification.softDeleteBanners = function (req,res){
  //console.log(req.body)
  return new Promise(function(resolve,reject){
      Gamification.findOneAndUpdate({_id : req.body.id},{active: req.body.active}).then((result)=>{
          console.log(result)
          res.send({status:200,message:`Successfully deleted the banner`})
      })
  });
}

Gamification.editBanner = function (req,res){
  //console.log(req.body)
  return new Promise(function(resolve,reject){
      Gamification.findOneAndUpdate({_id : req.body.id},{category: req.body.category}).then((result)=>{
          console.log(result)
          res.send({status:200,message:`Successfully updated the banner`})
      })
  });
}

Gamification.getMostDownloadedBanners = async function (req, res) {
  const query = req.query;
  const product = query.product;
  try {
    let bannersRes = [];
    const mostDownloadedBanners = [];
    let mostDownloadedBannersCount = 0;

    const sourceArr = query.sourceArr && query.sourceArr.split(",");
    const today = new Date();
    today.setDate(today.getDate() - query.startDate);
    const aggregatedBanners = await BannerAudit.aggregate([
      {
        $match: {
          updatedOn: { $gte: today },
          source: { $in: sourceArr },
          tags: "custom_download"
        },
      },
      {
        $group: { _id: "$banner_id", count: { $sum: 1 } },
      },
      { $sort: { count: -1 } },
    ]).exec();

    const aggregatedBannerIds = aggregatedBanners.map((banner) => banner._id).filter(id => id ? id : null);
    const downloadedBannersInfo = await Gamification.find({
      _id: { $in: aggregatedBannerIds },
    });

    for (const bannerId of aggregatedBannerIds) {
      if (mostDownloadedBannersCount >= query.limit) {
        break;
      }
      const bannerDetails = downloadedBannersInfo.find((banner) => banner.id === bannerId);
      if (bannerDetails.active && bannerDetails.product === product) {
        mostDownloadedBanners.push(bannerDetails);
        mostDownloadedBannersCount++;
      }
    }

    const remainingBannersLen = query.limit - mostDownloadedBanners.length;

    bannersRes = mostDownloadedBanners;
    if (remainingBannersLen) {
      const recentlyUploadedBanners = await Gamification.find(
        {
          _id: { $nin: aggregatedBannerIds },
          active: true,
          product,
        },
        { vizardUrl: 0 }
      )
        .sort({ updatedOn: -1 })
        .limit(remainingBannersLen)
        .exec();

      bannersRes = bannersRes.concat(recentlyUploadedBanners);
    }

    const updateObj = {
      product,
      aggregatedArr: bannersRes,
      updatedAt: new Date(),
    };
    await ContentAggregation.findOneAndUpdate(
      { product, category: "banners" },
      updateObj,
      {
        new: true,
        upsert: true,
      }
    ).exec();
    return res.json({ message: "Success", bannersLength: bannersRes.length });
  } catch (err) {
    console.log("error in get most downloaded banners", { product, err });
    return res.status(err.status || 500).json(err);
  }
};

module.exports = Gamification;
