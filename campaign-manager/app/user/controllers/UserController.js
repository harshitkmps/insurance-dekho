// Configuring Passport
var path            = require('path');
var md5             = require('md5');
var userModel       = require('../models/UserModel');
var authHelper      = require(HELPER_PATH+'AuthHelper.js');
var bCrypt = require('bcryptjs');

module.exports = {
 
    getLogin: function(req, res){
        if(!req.isAuthenticated()){
            res.render(path.join(BASE_DIR, 'app/user/views', 'login'),{layout:false,message: req.flash('message')});
        }else{
            res.redirect('/');
        }
    },

    postLogin: function(req, res,next){

        let isValid = true;
        if(!req.body.username && !req.body.password){
            req.flash('message', 'Username and password is required');
        }else if(!req.body.username){
            req.flash('message', 'Username is required');
        }else if(!req.body.password){
            req.flash('message', 'Password is required');
        }   
        if(isValid){
            passport.authenticate('login', function(err, user, info) {
                if (err) {
                    return next(err); // will generate a 500 error
                }
                if (!user) {
                    return res.status(409).render(path.join(BASE_DIR, 'app/user/views', 'login'),{layout:false,message: req.flash('message')});
                }
                req.login(user, function(err){
                    if(err){
                        console.error(err);
                        return next(err);
                    }
                    return res.redirect('/');
                });
            })(req, res, next);
        }
    },

    getSignup: function(req, res){
        if(!req.isAuthenticated()){
            res.render('register',{message: req.flash('message')});
        }else{
            res.redirect('/registration/text');
        }
    },
 
    postSignup: function(req,res){
        userModel.getUserByUsername(req.body.username,(err,result) => {
            if(err){
                req.flash('message', 'Something went wrong!');
            }
            else if(!result){
                req.body.password = bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(10), null);
                userModel.create(req.body,(err , result) => {});
                res.redirect('/user');
            }else{
                req.flash('message', 'Username is already exist')
                res.redirect('/user/create');
            }
        });
    },
    
    logout:function(req, res){
        req.logout();
        res.redirect('/user/login');
    },
    
    getUserToken: function(req, res){
        var data    = new Object();
        //var key     = {'name':'carDekho',insurance:true};
        if(req.body.email){
            userModel.getUserByEmail(req.body.email, function(err, user){ 
                if(user){
                    authHelper.generateToken(user.toJSON(), function(token){
                        if(token){
                            data.token     = token;
                            authHelper.sendResponse(res, 200, false, data);
                        }else{
                            authHelper.sendResponse(res, 400, 'Error can not be generated.');
                        }
                    });
                }else{
                    authHelper.sendResponse(res, 204, 'User does not exist.');
                }
            });
        }else{
            authHelper.sendResponse(res, 400, 'Email is required.');
        }
    },
    userList: function(req, res){
        let page = 1;
        if(req.query.page){
            page = req.query.page;
        }
        userModel
            .getUserList(page)
            .then(function(result){
                return res.render(
                    path.join(BASE_DIR, 'app/user/views', 'user_index'),
                    {
                        result:result.result,page:page,
                        limit:result.limit,
                        start:result.start,
                        recordCount:result.recordCount
                    });
            })
            .catch(err => {
                console.log("Error : ",err);
            })
    },

    userUpdate: function(req, res){
        if(req.body.password){
            req.body.password = bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(10), null);  
        }else{
            delete req.body.password;
        }
        userModel
            .userUpdate(req.body)
            .then(function(result){
                return res.redirect('/user');
            })
            .catch(err => {
                console.log("Error ", err);
            })
    },
    checkUsername: async function(req, res){
        let user = await userModel.findOneAsync({username:req.body.username});
        if(user){
            return res.json({valid:false});
        }else{
            return res.json({valid:true});
        }
    }
}
