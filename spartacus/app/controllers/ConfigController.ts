/**
 * Author - Ankit Shukla
 * Module - Used for generating internal logs
 */

import _ from 'lodash';
import ConfigService from '@app/services/ConfigService';
import logger from '@app/config/services/WinstonConfig';
import ERROR_Constants from '@constants/ErrorConstants';
import cleanDeep from 'clean-deep';
import { RequestDestination } from '@app/enums/RequestDestination';

export default class ConfigController {

    static createConfiguration = async (req: any, res: any) => {
        const params = cleanDeep(req.body);
        try {
            const data = await ConfigService.createConfig(params);
            return res.return(200, 'SUCCESS', RequestDestination.GEO_REVERSE_CODING_MAPPPING, data);
        } catch (err) {
            logger.error(`Error in getting Address from lat long : ${err}`);
            return res.error(500, 'SERVER_ERROR', RequestDestination.GEO_REVERSE_CODING_MAPPPING, { ...ERROR_Constants.PC_GCPM_001, ...{ [ERROR_Constants.ERROR_DESC]: err } });
        }
    };

    static getConfiguration = async (req: any, res: any) => {
        const params = cleanDeep(req.query);
        try {
            const data = await ConfigService.syncConfig();
            return res.return(200, 'SUCCESS', RequestDestination.GEO_REVERSE_CODING_MAPPPING, data);
        } catch (err) {
            logger.error(`Error in getting Address from lat long : ${err}`);
            return res.error(500, 'SERVER_ERROR', RequestDestination.GEO_REVERSE_CODING_MAPPPING, { ...ERROR_Constants.PC_GCPM_001, ...{ [ERROR_Constants.ERROR_DESC]: err } });
        }
    };

    static setConfiguration = async (req: any, res: any) => {
        const params = cleanDeep(req.body);
        try {
            const data = await ConfigService.updateConfig(params);
            return res.return(200, 'SUCCESS', RequestDestination.GEO_REVERSE_CODING_MAPPPING, data);
        } catch (err) {
            logger.error(`Error in getting Address from lat long : ${err}`);
            return res.error(500, 'SERVER_ERROR', RequestDestination.GEO_REVERSE_CODING_MAPPPING, { ...ERROR_Constants.PC_GCPM_001, ...{ [ERROR_Constants.ERROR_DESC]: err } });
        }
    };

};