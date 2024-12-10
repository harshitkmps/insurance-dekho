/**
 * Author - Ankit Shukla
 * Module - Used for config
 */

import _ from "lodash";
import mongo from '@db/Mongo';
import tables from '@db/Tables';
import { Schema } from "mongoose";
import cleanDeep from "clean-deep";
import storageHelper from "@helpers/StorageHelper";
import CommonHelper from "@app/utils/helpers/CommonHelper";
import logger from "@app/config/services/WinstonConfig";

/**
 * A Schema is a JSON object that defines the the structure and contents of your data.
 */

export default class ConfigModel {

    private static readonly configSchema = new Schema(
        {
            "config_name"       :   String,
            "config_data"       :   { type: Schema.Types.Mixed, default: {} },
            "created_at"        :   String,
            "updated_at"        :   String,
            "x-correlation-id"  :   String,
            "x-meta-data"       :   { type: Schema.Types.Mixed, default: {} },
        },
        { collection: tables.MONGO.CONFIG },
    );

    private static model: any;

    public static config: any;

    constructor() {
        ConfigModel.model = mongo.mongoDatabase.model('config', ConfigModel.configSchema);
        ConfigModel.readConfig()
    }

    public static async readConfig() {
        const config: any = {};
        const allConfig: any = await ConfigModel.model.find();
        _.forEach(allConfig, (configData: any) => {
            config[configData.config_name] = configData.config_data;
        });
        ConfigModel.config = config;
        logger.info(`Configuration Picked : \n ${JSON.stringify(config)}`);
        return config;
    }

    public static async createConfig(config_name: any, payload: any) {
        const data = await ConfigModel.getConfigData({ config_name: config_name});
        if(data) return false;
        payload = cleanDeep(payload);
        const x_correlation_id = await storageHelper.getCorrelationId();
        const meta_data = await storageHelper.getMetaData();
        payload = { ...payload, ...x_correlation_id, ...meta_data, ...{ created_at: CommonHelper.getDateTime(), updated_at: CommonHelper.getDateTime() } };
        return await ConfigModel.model.create(payload);
    }

    public static async updateConfig(config_name: any, payload: Object) {
        const response = { rawConfig: ConfigModel.config[config_name], modifiedConfig: {}};
        await ConfigModel.model.updateOne({ config_name: config_name }, { $set: { ...payload, ...{ updated: CommonHelper.getDateTime() } } });
        response.modifiedConfig = payload;
        await ConfigModel.readConfig();
        return response;
    }

    public static async getConfigData(params: any) {
        return await ConfigModel.model.findOne(params);
    }

}

// new ConfigModel();