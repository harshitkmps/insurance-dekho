process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";
require('../../config/env')
let mongoose = require('../../src/backend/db/db')

var configSchema = new mongoose.Schema({
    config : Object,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
    }, {collection: 'config'}
);

var ConfigModel = mongoose.model('config', configSchema);

module.exports = {
    getConfig : async function(){
        let appConfig = await ConfigModel.findOne({});
        return appConfig;
    }
};
