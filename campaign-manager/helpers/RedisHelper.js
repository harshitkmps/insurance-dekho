var commonHelper = require('./CommonHelper');

module.exports = {
    
    setKey: function(key, data){ 
        return new Promise(function(resolve, reject) {
            try{
                redisClient.set(key, data);
                if(config.redisKeyExpiryTime){
                    var timeArr = config.redisKeyExpiryTime.split(":");
                    var time = new Date().setHours(timeArr[0], timeArr[1], timeArr[2], timeArr[3]);
                    redisClient.expireat(key, parseInt(time/1000));
                }
                resolve(data);
            }catch(e){
                console.log(e);
                resolve(null);
            }
        });
    },
    
    setJSON: function(key, data){   
        return this.setKey(key, JSON.stringify(data));
    },
    
    
    getKey: function(key){
        return new Promise(function(resolve, reject) {
            try{
                redisClient.getAsync(key).then(function(result){
                    resolve(result);
                },function(err){
                    resolve(null);
                });
            }catch(e){
                resolve(null);
            }
        });
    },
    
    getJSON: function(key){
        return new Promise(function(resolve, reject) {
            module.exports.getKey(key).then(function(data){
                try {
                    resolve(JSON.parse(data));
                }catch (e) {
                    resolve(null);
                }
            }, function (err){
                resolve(null);
            });    
        });
    }   
}
