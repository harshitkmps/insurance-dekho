import logger from '@app/config/services/WinstonConfig';
import API_Constants from "@app/utils/constants/ApiConstants";
import GeoCodingService from '@services/GeocodingService';
import { UseCache } from './helpers/cache-helper';

export default class PincodeLatLongService {

  @UseCache({ expiryTimer: API_Constants.EXPIRATION_TIME.PINCODE_TO_LAT_LANG })
  public static async fetchLatLongFromPincode(address: any) {

    let location;
    try {
      const result = await GeoCodingService.getAddressFromLatLong({ address });
      const geometry = result?.data?.results?.[0]?.geometry?.location;

      const latitude = geometry?.lat;
      const longitude = geometry?.lng;
      if (latitude && longitude) {
        location = { latitude, longitude }
        return location;
      }
      else {
        return;
      }
    } catch (error) {
      logger.error(`Error in fetching and setting location : ${error}`);
      return;
    }
  };
};

