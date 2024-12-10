/**
 * Author - Ankit Shukla
 * Module - Used for getting address and pincode corresponding to latitude and longitude
 */

import _ from 'lodash';
import validations from '@validations/ValidationRules';
import PincodeService from '@services/PincodeService';
import logger from '@app/config/services/WinstonConfig';
import ERROR_Constants from '@constants/ErrorConstants';
import ValidationEngine from '@validations/ValidationEngine';
import { RequestDestination } from '@app/enums/RequestDestination';
import pincodesConstant from '@app/utils/constants/pincodesConstant';
import ApiConstants from '@app/utils/constants/ApiConstants';
import PincodesListWithinDistanceService from '@app/services/PincodeListWithinDistanceService';



class PincodeController {
   
    convertArrayInAcceptedFormForGoogleApi = (listOfPinCodes: string[]) => {
        if(!listOfPinCodes || (listOfPinCodes && listOfPinCodes.length<=0)){
            return "";
        }

        let res = listOfPinCodes[0];
        for(let i = 1;i<listOfPinCodes.length;i++){
            res = res + "|" + listOfPinCodes[i];
        }

        return res;
    }

    getDistanceAndTimeBtwPincodes = async (req: any, res: any) => {
        const queryParams = req.query;
       
        try {
            let pincodeSrc = queryParams.sources.split(',');
            let pincodeDes = queryParams.destinations.split(',');
            let data;

            for(let i = 0;i<pincodeSrc.length;i+=10){
                for(let j = 0;j<pincodeDes.length;j+=10){
                    let tempPinCodeSrcInGoogleApiAcceptedFormate = this.convertArrayInAcceptedFormForGoogleApi(pincodeSrc.splice(i, Math.min(i+10, pincodeSrc.length)))
                    let tempPinCodeDesInGoogleApiAcceptedFormate = this.convertArrayInAcceptedFormForGoogleApi(pincodeDes.splice(j, Math.min(j+10, pincodeDes.length)))
                    let option = {
                        data :{
                            origins: tempPinCodeSrcInGoogleApiAcceptedFormate,
                            destinations: tempPinCodeDesInGoogleApiAcceptedFormate
                        }
                    }
                    let tempData = await PincodeService.getDistanceAndTimeBtwPincodes(option);
                    data = {data, ...{tempData}}
                }
            }
            return res.return(200, 'SUCCESS', RequestDestination.GEO_REVERSE_CODING_MAPPPING, data);
        } catch (err) {
            logger.error(`Error in getting Address from lat long : ${err}`);
            return res.error(500, 'SERVER_ERROR', RequestDestination.GEO_REVERSE_CODING_MAPPPING, { ...ERROR_Constants.PC_GCPM_001, ...{[ERROR_Constants.ERROR_DESC] : err} } );
        }
    };

    pincodesList = async (req: any, res: any) => {
        const pincode = req.query.pincode;
        const pincodeNumber = Number(pincode);
        const radiusn = req.query.radius || ApiConstants.PINCODES_RADIUS;

        const radius = Number(radiusn);
        let params = {
            pincodeNumber,
            radius
        }
        try {
            const validationError = ValidationEngine.validate(validations.rules.pincodeValidationRule, {pincode});
            if(validationError) {
                logger.warn(`Validation Error in pincode : ${validationError}`);
                return res.error(400, 'INVALID_REQUEST', RequestDestination.PINCODES_DISTANCE_MAPPING , { ...ERROR_Constants.PC_GCPM_002, ...{[ERROR_Constants.ERROR_DESC] : validationError} } );
            };
            if (isNaN(radius) || radius > ApiConstants.RADIUS_LIMIT.UPPER_LIMIT ) {
                logger.warn('Invalid or exceeded radius limit.');
                return res.error(400, 'INVALID_REQUEST', RequestDestination.PINCODES_DISTANCE_MAPPING, 'Invalid or exceeded radius limit.');
            }
            const data = await PincodesListWithinDistanceService.findPincodes(params);
            return res.return(200, 'SUCCESS', RequestDestination.PINCODES_DISTANCE_MAPPING, data);
        } catch (err) {
            logger.error(`Error in getting Pincode Data : ${err}`);
            return res.error(404, 'URL_NOT_FOUND', RequestDestination.PINCODES_DISTANCE_MAPPING, `${err}`);
        }
    };
    getDistanceAndTimeBtwPincodeForSingleDestination = async (req: any, res: any) => {
        const queryParams = req.query;

        try {
            let pincodeSrc: string[] = queryParams.sources.split(',');
            let pincodeDes = queryParams.destinations;
            let pincode: string = queryParams.destinations.toString();

            let data;
            const validationError = ValidationEngine.validate(validations.rules.pincodeValidationRule, { pincode });
            if (validationError) {
                logger.warn(`Validation Error in pincode : ${validationError}`);
                return res.error(400, 'INVALID_REQUEST', RequestDestination.PINCODES_DISTANCE_MAPPING, { ...ERROR_Constants.PC_GCPM_002, ...{ [ERROR_Constants.ERROR_DESC]: validationError } });
            };
            if (pincodeSrc.length > ApiConstants.SOURCE_LIMIT.UPPER_LIMIT) {
                // Return a 400 error if the limit is exceeded
                return res.error(400, 'INVALID_REQUEST', RequestDestination.PARTNERS_DISTANCE_MAPPING, `Exceeded maximum allowed sources. Maximum is ${ApiConstants.SOURCE_LIMIT.UPPER_LIMIT}.`);
            }

            for (let i = 0; i < pincodeSrc.length; i += 25) {
                const uniqueSourcesSet = new Set(pincodeSrc);
                const uniqueSourcesArray = Array.from(uniqueSourcesSet);

                logger.info(`unique, ${uniqueSourcesArray}`)

                /// Find duplicate pincodes
                const duplicateSources = pincodeSrc.filter((pincode, index) => {
                    // Check if the current pincode has a duplicate later in the array
                    return pincodeSrc.indexOf(pincode) !== index;
                });

                logger.info(`duplicateSources, ${duplicateSources}`);
                let tempPinCodeSrcInGoogleApiAcceptedFormate = this.convertArrayInAcceptedFormForGoogleApi(uniqueSourcesArray.splice(i, Math.min(i + 25, pincodeSrc.length)))

                const result = await PincodeService.checkMappingExistsInDatabase(tempPinCodeSrcInGoogleApiAcceptedFormate, pincodeDes);

                let results: any = [];
                const tempArray = result.tempArray;

                logger.info(`tempArray, ${tempArray}`)
                const dataArray = result.ansArray;
                logger.info(`ansArray, ${dataArray}`)

                const tempStringArray: string[] = tempArray.map(String);


                tempPinCodeSrcInGoogleApiAcceptedFormate = this.convertArrayInAcceptedFormForGoogleApi(tempStringArray);
                if (tempPinCodeSrcInGoogleApiAcceptedFormate) {
                    let option = {
                        data: {
                            origins: tempPinCodeSrcInGoogleApiAcceptedFormate,
                            destinations: pincodeDes,
                        }
                    }
                    let tempData = await PincodeService.getDistanceAndTimeBtwPincodes(option);


                    let params = {
                        tempData,
                        tempArray,
                        dataArray,
                        pincodeDes,
                    }

                    results = await PincodeService.getDistanceAndTimeBtwPincodeSingleDestination(params);
                    for (const result of results) {
                        // Determine the status for each object based on your conditions
                        const status = result.source ? true : false;

                        // Add status field to the object
                        result.status = status;
                    }
                  
                }

                if (!data) {
                    results = dataArray

                }

                for (const duplicateSource of duplicateSources) {
                    const duplicateSourceNumber = parseInt(duplicateSource);

                    // Find the corresponding result for the duplicate source from the unique results
                    const result = results.find((r: any) => r.source === duplicateSourceNumber);
                    // If a result is found, add it to the duplicate results array
                    if (result) {
                        results.push(result);
                    }
                }

                data = { data, ...{ results } }

            }
            return res.return(200, 'SUCCESS', RequestDestination.PARTNERS_DISTANCE_MAPPING, data);
        } catch (err) {
            logger.error(`Error in getting partners list : ${err}`);
            return res.error(500, 'SERVER_ERROR', RequestDestination.PARTNERS_DISTANCE_MAPPING, { ...ERROR_Constants.PC_GCPM_001, ...{ [ERROR_Constants.ERROR_DESC]: err } });
        }
    };



};

export const pincodeController = new PincodeController();
