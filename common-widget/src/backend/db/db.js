var mongoose    = require('mongoose');
require('../../../config/env')

var options = {
    auto_reconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    keepAlive: 1,     
    bufferMaxEntries: 0 // If not connected, return errors immediately rather than waiting for reconnect  
};

mongoose.connect(process.env.mongooseQueryString, options, function (err, db) {
    if (err) {
        console.log(err);
    }
    global.db = db;
});

mongoose.connection.on('error', function (e) {
    console.log("db: mongodb error " + e);
    // reconnect here
});

mongoose.connection.on('connected', function (e) {
    console.log('db: mongodb is connected: ');
});

mongoose.connection.on('disconnected', function () {
    console.log('db: mongodb is disconnected');
});

mongoose.connection.on('reconnected', function () {
    console.log('db: mongodb is reconnected: ');
});

mongoose.connection.on('timeout', function (e) {
    console.log("db: mongodb timeout " + e);

    // reconnect here
});

mongoose.connection.on('close', function () {
    console.log('db: mongodb connection closed');
});

module.exports =  mongoose;
