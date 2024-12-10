
var UserSchema = new Schema({
    firstname   : String,
    lastname    : String,
    username    : String,
    password    : String,
    role        : Number,
    status     : {type:Number,default:1},
    created_at  : {type:Date, default:Date.now()},
    updated_at  : {type:Date, default:Date.now()}
});

var User = mongoose.model('User', UserSchema);

User.getUserById = function(id, callback){ 
    User.findOne({_id:id}, function (err, user){
        if (!err) {
            callback(err,user);
        }else{
            callback(err);
            console.log(err);
        } 
    });
}

User.getUserByUsername =  function(username, callback){    
    User.findOne({username:username}, function (err, user){
        if (!err) {
            callback(err,user);
        }else{
            callback(err);
            console.log(err);
        } 
    });
}

User.getUserByEmail = function(email, callback){    
    User.findOne({email:email}, function (err, user){
        if (!err) {
            callback(err,user);
        }else{
            callback(err);
            console.log(err);
        } 
    });
}

User.getUserList = function(page = 1){
    var page  = page;
    var start = 0;
    var limit = 10;
    start = parseInt((page*limit) - limit);

    return new Promise( async function(resolve , reject){
        let recordCount     = await User.countDocumentsAsync();
        User
            .find({})
            .skip(start)
            .sort({created_at:-1})
            .limit(limit)
            .exec(function(err, result){
                if(err){
                    reject(err);
                }else{
                    resolve({
                        page:page,
                        start:start,
                        limit:limit,
                        recordCount:recordCount,
                        result:result
                    });
                }                
            })
    });
}

User.userUpdate = function(requestData = {}){
    return new Promise( async function(resolve, reject){
        if(requestData){
            User.findByIdAndUpdate(requestData.user_id,requestData,(err, updateResult) => {
                if(err){
                    reject(err);
                }else{
                    resolve(updateResult);
                }
            });
        }else{
            reject(null);
        }
    })
}
module.exports = User;

