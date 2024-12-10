/**
 * Author - Ankit Shukla
 * Module - Used for generating config
 */

import logger from "@config/services/WinstonConfig";
import ConfigModel from "@app/models/ConfigModel";

export default class ConfigService {

    public static dynamicConfig() {
        try {
            if(ConfigModel.config) return ConfigModel.config;
            return ConfigModel.readConfig();
        } catch (err) {
            logger.error(`Error in getting Address from lat long : ${err}`);
            throw err;
        }
    };

    public static async createConfig(data: any) {
        try {
            return ConfigModel.createConfig(data.config_name, data);
        } catch (err) {
            logger.error(`Error in getting Address from lat long : ${err}`);
            throw err;
        }
    };

    public static async updateConfig(data: any) {
        try {
            return ConfigModel.updateConfig(data.config_name, {config_data: data.config_data});
        } catch (err) {
            logger.error(`Error in getting Address from lat long : ${err}`);
            throw err;
        }
    };

    public static async syncConfig() {
        try {
            return await ConfigModel.readConfig();
        } catch (err) {
            logger.error(`Error in syncConfig : ${err}`);
            throw err;
        }
    };
};