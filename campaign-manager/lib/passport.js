// Configuring Passport
var path            = require('path');
var md5             = require('md5');
var user            = require('../app/user/models/UserModel');
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcryptjs');

module.exports = function (passport) {
    
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        user.getUserById(id, function(err, user) {
          done(err, user);
        });
    });

    passport.use('login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback : true
      },
    function(req, username, password, done) { 
        // check in db if a user with username exists or not
        user.getUserByUsername(username, 
            function(err, user) {
		
              // In case of any error, return using the done method
              if (err)
                return done(err);
              // Username does not exist, log error & redirect back
              if (!user){
                  console.log('User Not Found with username '+username);
                  return done(null, false, 
                  req.flash('message', 'User Not found'));                 
              }

              if(!user.status){
                  console.log('Account is not active for '+username);
                  return done(null, false, 
                  req.flash('message', 'Your account is in-active'));   
              }
              // User exists but wrong password, log the error 
              isValidPassword(user, password)
              .then(function(result){
                 if(!result){
                    console.log('Invalid Password');
                    return done(null, false, 
                    req.flash('message', 'Invalid Password'));
                 }
                 return done(null, user);
              })
              
              // User and password both match, return user from 
              // done method which will be treated like success
              
            }
        );
    }));

    passport.use('lookup', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            findOrCreateUser = function(){
                // find a user in Mongo with provided username
                User.findOne({'username':username},function(err, user) {
                    // In case of any error return
                    if (err){
                      console.log('Error in SignUp: '+err);
                      return done(err);
                    }
                    // already exists
                    if (user) {
                      console.log('User already exists');
                      return done(null, false, 
                         req.flash('message','User Already Exists'));
                    } else {
                      // if there is no user with that email
                      // create the user
                      var newUser = new User();
                      // set the user's local credentials
                      newUser.username = username;
                      newUser.password = createHash(password);
                      newUser.email = req.param('email');
                      newUser.firstName = req.param('firstName');
                      newUser.lastName = req.param('lastName');

                      // save the user
                      newUser.save(function(err) {
                        if (err){
                          console.log('Error in Saving user: '+err);  
                          throw err;  
                        }
                        console.log('User Registration succesful');    
                        return done(null, newUser);
                      });
                    }
                });
            };   
        // Delay the execution of findOrCreateUser and execute 
        // the method in the next tick of the event loop
        process.nextTick(findOrCreateUser);
    }));
};

var isValidPassword =  async function(user, password){
  var match = await bCrypt.compare(password, user.password);
  if(match === true) {
      return true;
  }
  else{
     return false;
  }
  
}

// Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
