const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const createJsonHash = require("./server-utils/createJsonHash");
const contentMetaData = require('./src/backend/ContentMetaData');
const completionStatus = require('./src/backend/CompletionStatus');
const gamification = require('./src/backend/Gamification');
const frontendContentController = require("./src/backend/FrontendContent");
 

process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";
require("./config/env");
// const MongoClient = require("mongodb").MongoClient;
// let deviceFpLogsCollection = false;
// MongoClient.connect(
//   "mongodb://127.0.0.1:27017/?readPreference=primary&directConnection=true&ssl=false",
//   (err, client) => {
//     // ... do something here
//     console.log("Mongo Connected");
//     const fpdb = client.db("device_fp");
//     deviceFpLogsCollection = fpdb.collection("logs");
//   }
// );
const atob = (str) => Buffer.from(str, "base64").toString("binary");
const cookieName = "deviceId";
const sendDeviceIdCookie = (deviceId, res) => {
  // Our token expires after one day
  const oneDayToSeconds = 24 * 60 * 60;
  res.cookie(cookieName, deviceId, {
    maxAge: oneDayToSeconds,
    // You can't access these tokens in the client's javascript
    httpOnly: true,
    // Forces to use https in production
    secure: process.env.NODE_ENV === "production" ? true : false,
  });
};
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "build")));

app.post("/done.svg", function (req, res) {
  if (!req.cookies || req.cookies[cookieName] == undefined) {
    let fp = JSON.parse(atob(req.body.fp));
    // deviceFpLogsCollection
    //   .insertOne(fp)
    //   .then((result) => {
    //     console.log("mongodb insert result => ", result);
    //   })
    //   .catch((error) => console.error(error));
    let hash = createJsonHash(fp);
    sendDeviceIdCookie(hash, res);
  }
  const img =
    '<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 512 512" width="24px" height="24px"><path fill="#32BEA6" d="M504.1,256C504.1,119,393,7.9,256,7.9C119,7.9,7.9,119,7.9,256C7.9,393,119,504.1,256,504.1C393,504.1,504.1,393,504.1,256z"/><path fill="#FFF" d="M392.6,172.9c-5.8-15.1-17.7-12.7-30.6-10.1c-7.7,1.6-42,11.6-96.1,68.8c-22.5,23.7-37.3,42.6-47.1,57c-6-7.3-12.8-15.2-20-22.3C176.7,244.2,152,229,151,228.4c-10.3-6.3-23.8-3.1-30.2,7.3c-6.3,10.3-3.1,23.8,7.2,30.2c0.2,0.1,21.4,13.2,39.6,31.5c18.6,18.6,35.5,43.8,35.7,44.1c4.1,6.2,11,9.8,18.3,9.8c1.2,0,2.5-0.1,3.8-0.3c8.6-1.5,15.4-7.9,17.5-16.3c0.1-0.2,8.8-24.3,54.7-72.7c37-39.1,61.7-51.5,70.3-54.9c0.1,0,0.1,0,0.3,0c0,0,0.3-0.1,0.8-0.4c1.5-0.6,2.3-0.8,2.3-0.8c-0.4,0.1-0.6,0.1-0.6,0.1l0-0.1c4-1.7,11.4-4.9,11.5-5C393.3,196.1,397,184.1,392.6,172.9z"/></svg>';
  res.writeHead(200, {
    "Content-Type": "image/svg+xml",
    "Content-Length": img.length,
  });
  res.end(img);
});



app.get('/courses',function(req, res){
  contentMetaData.getContent(req,res);
})

app.get("/courses/most-watched-content", contentMetaData.getMostWatchedContent);

app.get('/health',function(req,res){
  contentMetaData.test(req,res)
})

app.post('/add',function(req,res){
  contentMetaData.add(req,res)
})

app.post('/status/:uuid/:content_id',function(req,res){
  completionStatus.updateStatus(req,res)
})

app.get('/status/:uuid',function(req,res){
  completionStatus.getCompletionStatus(req,res)
})

app.get("/allActiveCourses",(req,res)=>{
  contentMetaData.getAllActiveCourses(req,res);
})

app.post('/courses/markinactive',(req,res)=>{
  contentMetaData.softDeleteCourses(req,res);
})

app.post('/courses/edit',(req,res)=>{
  contentMetaData.editCourse(req,res);
})

//Gamification path
app.use(express.static(path.join(__dirname, "public")));

app.post("/gamification/banners", function(req,res){
  gamification.addBanner(req,res);
});

app.get("/gamification/banners", (req, res) => {
  gamification.getPaginatedBanner(req,res);
});

app.post("/gamification/banners/custom", (req, res) => {
  gamification.getCustomBanner(req,res);
});

app.post('/gamification/banners/markinactive',(req,res)=>{
  gamification.softDeleteBanners(req,res);
})

app.post('/gamification/banners/edit',(req,res)=>{
  gamification.editBanner(req,res);
})

app.get("/gamification/most-downloaded-banners", gamification.getMostDownloadedBanners);

app.post("/content", frontendContentController.addContent);
app.get("/content", frontendContentController.getContent);
app.put("/content/:id", frontendContentController.updateContent);

app.use("/collect", function (req, res) {
  console.log(req.cookies[cookieName], req.body);
  res.end();
});
app.listen(process.env.PORT, function () {
  console.log(`Widget server started running at ${process.env.PORT} port`);
});
