/**
 * Author - Ankit Shukla
 * Module - Used for getting address and pincode corresponding to latitude and longitude
 */

import _ from 'lodash';
import validations from '@validations/ValidationRules';
import GeoCodingService from '@services/GeocodingService';
import logger from '@app/config/services/WinstonConfig';
import ERROR_Constants from '@constants/ErrorConstants';
import ValidationEngine from '@validations/ValidationEngine';
import StorageHelper from '@app/utils/helpers/StorageHelper';
import { RequestDestination } from '@app/enums/RequestDestination';

export default class GeoCodingController {

    static geoCoding = async (req: any, res: any) => {
        const queryParams = req.query;
        try {
            const validationError = ValidationEngine.validate(validations.rules.geoCodingValidationRule, queryParams);
            if(validationError) {
                logger.warn(`Validation Error in geoCoding : ${validationError}`);
                return res.error(400, 'INVALID_REQUEST', RequestDestination.GEO_REVERSE_CODING_MAPPPING , { ...ERROR_Constants.PC_GCPM_002, ...{[ERROR_Constants.ERROR_DESC] : validationError} } );
            };
            const data = await GeoCodingService.getAddressFromLatLong(queryParams);
            return res.return(200, 'SUCCESS', RequestDestination.GEO_REVERSE_CODING_MAPPPING, data);
        } catch (err) {
            logger.error(`Error in getting Address from lat long : ${err}`);
            return res.error(500, 'SERVER_ERROR', RequestDestination.GEO_REVERSE_CODING_MAPPPING, { ...ERROR_Constants.PC_GCPM_001, ...{[ERROR_Constants.ERROR_DESC] : err} } );
        }
    };

};