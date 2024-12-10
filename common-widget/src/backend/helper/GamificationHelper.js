var Path = require("path");
const Fs = require("fs");
const parse = require("url-parse");
const queryString = require("query-string");
const axios = require("axios");
const AWS = require("aws-sdk");
require('../../../config/env')

const ID = process.env.ID;
const SECRET = process.env.SECRET;

const BUCKET_NAME = process.env.BUCKET_NAME;
AWS.config.update({
  accessKeyId: ID,
  secretAccessKey: SECRET,
  region: process.env.region,
  
});
var s3 = new AWS.S3({signatureVersion: 'v4' });


const parser = (Url) => {
    const url = new URL(Url);
    let parsedUrl = parse(url);
    const parsed = queryString.parse(parsedUrl.query);
    const parsedResult = [];
    for (let [key, value] of Object.entries(parsed)) {
      //console.log(`${key}: ${value}`);
      const title = key.charAt(0).toUpperCase() + key.slice(1);
      var temp = {
        title: title,
        variable: key,
        value: value,
        // maxLength
      };
      parsedResult.push(temp);
    }
    let currentPos=0;
    let fieldindex;
    let orderOfFields = ['Name','Mobile','Email'];
    for(let i in orderOfFields){
      fieldindex = parsedResult.findIndex((item,index)=>{if(item.variable == orderOfFields[i])return index})
      if(fieldindex != -1){
        [parsedResult[fieldindex],parsedResult[currentPos]]=[parsedResult[currentPos],parsedResult[fieldindex]]
        currentPos++;
      }
    }
    //console.log(parsedResult)
    return parsedResult;
};

const convertToLink = (editableList, vizardUrl) => {
    const url = new URL(vizardUrl);
    var parsedUrl = parse(url);
    var parsed = queryString.parse(parsedUrl.query);
    var editList = {};
    editableList.forEach((item) => {
      var key = item.variable;
      editList[key] = item.value;
    });
    var obj = {
      ...parsed,
      ...editList,
    };
    var link = url.origin + url.pathname + "?" + queryString.stringify(obj);
    return link;
};

async function downloadImage (url,filename) {  
  const path = Path.resolve(__dirname, filename)
  const writer = Fs.createWriteStream(path)

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

const uploadFile = async (type,filename) => {
    
    const Key = `${process.env.AWS_PREFIX}/dev/banners/${type}/${filename}.jpg`
    console.log(Key);
    Fs.readFile(filename, (err, data) => {
       if (err) throw err;
       const params = {
           Bucket: BUCKET_NAME , // pass your bucket name
           Body: data,
           Key:Key,
           ContentType: 'image/jpeg',
           ContentDisposition: "attachment"
       };
       s3.upload(params, function(err, data) {
           if (err) {
              return err;
           }
           console.log(`File uploaded successfully at ${data.Location}`)
           return data.Location;
           
       });
    });
};

// var url="https://fast.vizardapps.com/dynamic/v1.0/xpanK8E4GZYtrKCXiymF/rO0HKbsGxZYeJjDNkw6v/ixCcf255q0YsYvEEVbxX/t_unsigned,bg_false,f_.jpg?cta=Buy%20it%20Now&image_link=https%3A%2F%2Fcdn.pixabay.com%2Fphoto%2F2015%2F04%2F19%2F08%2F32%2Fmarguerite-729510__480.jpg"
module.exports = {parser,convertToLink,downloadImage,uploadFile};