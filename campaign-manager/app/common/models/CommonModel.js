var CommonHelper = require(HELPER_PATH+'CommonHelper');
var RedisHelper  = require(HELPER_PATH+'RedisHelper');

var CommonModel = {};

CommonModel.getCity = function(query){ 
    return new Promise( async function(resolve, reject) {
        query.fetchData = 'city';
        query.source    = config.source.autodb;
        query.subSource = config.subSource.vahanScrapper;
        
        try{
            let cities = await redisHelper.getJSON('cities');
            if(!cities){
                let result = await CommonHelper.sendGetRequestToBrokerage(query, '/api/v1/motor/getBkgMasterData');
                cities = await RedisHelper.setJSON('cities',result);  
                resolve(result);                   
            }else{
                resolve(cities);
            }
        }catch(e){
            reject(e);
        }
    });
}



module.exports = CommonModel;
