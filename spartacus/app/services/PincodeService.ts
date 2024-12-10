/**
 * Author - Ankit Shukla
 * Module - Used for accessing google geocdoing services
 */

const blame = require("blame");
import storageHelper from "@app/utils/helpers/StorageHelper";
import logger from "@config/services/WinstonConfig";
import apiHelper from "@helpers/ApiHelper";
import requestBuilder from '@helpers/RequestBuilder';
import { RequestTypes } from "@app/enums/RequestType";
import CommonHelper from "@app/utils/helpers/CommonHelper";
import Constants from "@app/utils/constants/Constants";
import P2PDistanceModel from "@app/models/P2PDistanceModel";
import { P2PData } from "@app/models/P2PDistanceModel";

export default class PincodeService {
    public static async checkMappingExistsInDatabase(srcPincodes: string, destPincode: number) {

        try {
            const srcPincodesArray: number[] = srcPincodes.split('|').map(Number);

            const promises = [];

            for (const srcPincode of srcPincodesArray) {

                logger.info(`sources,${srcPincode}`)
                // Create a promise for each findOne operation
                const promise = P2PDistanceModel.findOne({ source: srcPincode, destination: destPincode })
                    .then((mapping: any) => {
                        if (mapping !== null) {
                            return {
                                source: mapping.source,
                                destination: mapping.destination,
                                distance: mapping.distance,
                                time: mapping.time,
                                status:true,

                            }
                        } else {
                            return null; // No mapping found for this combination
                        }
                    });

                // Push the promise to the array
                promises.push(promise);
            }
            const results = await Promise.all(promises);

            const ansArray = results.filter(mapping => mapping !== null);
            const ansSrcPincodes = ansArray.map(mapping => mapping.source); // Extract source pin codes from ansArray
            const tempArray = srcPincodesArray.filter(srcPincode => !ansSrcPincodes.includes(srcPincode)); // Filter out srcPincodes not in ansArray


            return { tempArray, ansArray };
        } catch (error) {
            logger.error('Error checking mapping in the database:', error);
            throw error;
        }
    }

    public static async getDistanceAndTimeBtwPincodeSingleDestination(data: any) {
        let tempData = data.tempData;
        let tempArray = data.tempArray;
        let dataArray = data.dataArray;
        let destPincode = data.pincodeDes;
        let srcPincode;

        await Promise.all(tempData.data.rows.flatMap(async (row: any, srcIndex: number) => {
            let dataItem;
            await Promise.all(row.elements.map(async (element: any) => {
                srcPincode = tempArray[srcIndex]; // Get srcPincode from tempArray at the current index
                if(element.status=='OK'){

                 dataItem = {
                    source: srcPincode,
                    destination: destPincode, // Assuming destPincode is defined elsewhere
                    distance: element.distance.value,
                    time: element.duration.value
                };
            }
            else{
                dataItem = {};
            }
                dataArray.push(dataItem);
               if(Object.keys(dataItem).length !== 0){
                await P2PData.insertData(dataItem);
                 }

            }));
        }));

        return dataArray;
    }



    public static async getDistanceAndTimeBtwPincodes (data: any) {
        try {
            const responseData = await this.getDistanceAndTimeBtwPincodesMethods.getDistanceAndTimeBtwPincodes(data);
            logger.info(`data,${responseData}`)
            return { data :responseData};


        } catch (err) {
            logger.error(`Error in getDistanceAndTimeBtwPincodes : ${err}`);
            throw err;
        }
    };

    private static readonly getDistanceAndTimeBtwPincodesMethods = {
        getDistanceAndTimeBtwPincodes: async (payload: any) => {
            try {
                console.log("inside getDistanceAndTimeBtwPincodesMethods", payload);
                const request = requestBuilder.build(RequestTypes.DISTANCE_TIME_BASED_ON_PINCODE,payload);
                console.log("show request", request);
                const result = await apiHelper.httpRequest(request);
                console.log("result", result);
                storageHelper.setStackTraceData(CommonHelper.prepareStackTrace(Constants.STACK_TRACE.TYPE.LOG, blame.stack(), "fetched distance and time based on pincode"));
                return result;
            } catch (err) {
                storageHelper.setStackTraceData(CommonHelper.prepareStackTrace(Constants.STACK_TRACE.TYPE.FAILURE, blame.stack(), "unable to fetch distance and time based on pincode"));
                throw err;
            }
        }
    };
};