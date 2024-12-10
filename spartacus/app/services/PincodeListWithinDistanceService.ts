
import PincodeModel from "@app/models/PincodeModel";
import ApiConstants from "@app/utils/constants/ApiConstants";
import logger from "@app/config/services/WinstonConfig";

interface Location {
  location: {
    type: string;
    coordinates: number[];
  };
}


export default class PincodesListWithinDistanceService {

    public static async insertData(pincode: number, loc: { lng: number; lat: number }) {
      // Insert a single document into the collection
      const PincodeData = {
        pincode: pincode,
        location: {
          type: 'Point',
          coordinates: [loc.lng, loc.lat],
        },
      };
  
      try {
        // Insert the document using the model
        logger.info(`pincodeData:${PincodeData}`);
        const result = await PincodeModel.create(PincodeData);
        logger.info(`Pincode ${pincode} inserted successfully.`);
        return;
      } catch (err) {
        logger.error(`Error inserting pincode ${pincode}: ${err}`);
      }
    


  }
  public static async getLocationForPincode(pincode: number) {
    // get pincode location from db 
    try {
      const result = await PincodeModel.findOne({ pincode });
      if (result!=null && result!=undefined) {
        const { location } = result;

        return location;
      } 
      else{
        throw new Error("pincode does not exist in db ")
      }
     
    } catch (error) {
      logger.error("error retrieving location", error)
     throw error;
    }
  }

  public static async findPincodes(data:any) {
    try {
      const { pincodeNumber, radius } = data;
      const searchLocation = await this.getLocationForPincode(pincodeNumber);
      logger.info(`searchLocation:${searchLocation}`);
      
      const radiusInMeters = radius;
     
      if (searchLocation) {
        const nearbyPincodes =  await PincodeModel.aggregate([
          {
            $geoNear: {
              near: searchLocation,
              maxDistance:radiusInMeters,
              distanceField: "distance", // This will add a field 'distance' to each result
              spherical: true,
              limit:500
            },
          },
          {
            $project: {
              pincode: 1,
              location: 1,
              _id: 0,
              distance: 1,
            },
          }
        ]);
        const pincodeArray: { pincode: number; distance: number }[] = nearbyPincodes.map(({ pincode, distance }: { pincode: number; distance: number }) => ({
          pincode,
          displacement: Math.round(distance || 0),  // Access the distance from the result
        }));
        
  
        return { data: pincodeArray };
      }
    } catch (err) {
      logger.error("Pincode does not exist in db:",err);
      throw err;
    }
  }
  

};
