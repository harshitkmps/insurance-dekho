import validations from '@validations/ValidationRules';
import logger from '@app/config/services/WinstonConfig';
import ERROR_Constants from '@constants/ErrorConstants';
import ValidationEngine from '@validations/ValidationEngine';
import API_Constants from "@app/utils/constants/ApiConstants";

import SuggestionsService from "@services/SuggestionsService";
import PlaceDetailsService from "@app/services/PlaceDetailsService";

import { RequestDestination } from "@app/enums/RequestDestination";
import ApiConstants from '@app/utils/constants/ApiConstants';
import PincodeLatLongService from '@app/services/PincodeLatLongService';

export class SuggestionsController {
  static Suggestions = async (req: any, res: any) => {
    const input = req.query?.input;
    let location = req.query?.location;
    const pincode = req.query?.address;

    if (pincode) {
      const result = await PincodeLatLongService.fetchLatLongFromPincode(pincode);
      if(result){
        location= result.latitude + "," +result.longitude;
        console.log(location);
      }
      else{
        logger.error(`Error getting location from pincode`);
      }
   
    }
    logger.info(`location:${location}`)

    const requestData = {
      input,location
    };

    const components = API_Constants.COMPONENTS;
    const radius = API_Constants.RADIUS;
    let params = {
      input,
      location,
      components,
      radius,
    };
    try {
      const validationError = ValidationEngine.validate(validations.rules.autocompleteSuggestionsValidationRule, requestData);
      if (validationError) {
        logger.warn(`Validation Error in Suggestions : ${validationError}`);
        return res.error(400, 'INVALID_REQUEST', RequestDestination.AUTOCOMPLETE_SUGGESTIONS_MAPPING, { ...ERROR_Constants.PC_GCPM_002, ...{ [ERROR_Constants.ERROR_DESC]: validationError } });
      };
      const suggestions = await SuggestionsService.fetchSuggestions(params);
      return res.return(
        200,
        "SUCCESS",
        RequestDestination.AUTOCOMPLETE_SUGGESTIONS_MAPPING,
        suggestions
      );
    } catch (err) {
      logger.error(`Error in fetching suggestions : ${err}`);
      return res.error(500, 'SERVER_ERROR', RequestDestination.AUTOCOMPLETE_SUGGESTIONS_MAPPING, { ...ERROR_Constants.PC_GCPM_001, ...{ [ERROR_Constants.ERROR_DESC]: err } });

    }
  };
}

export class PlaceDetailsController {
  static PlaceDetails = async (req: any, res: any) => {
    const place_id = req.query.place_id;
    const fields = ApiConstants.FIELDS;
    let params = {
      place_id,
      fields
    }

    try {
      const validationError = ValidationEngine.validate(validations.rules.placeDetailsValidationRule, req.query);
      if (validationError) {
        logger.warn(`Validation Error in PlaceDetails : ${validationError}`);
        return res.error(400, 'INVALID_REQUEST', RequestDestination.PLACE_DETAILS_MAPPING, { ...ERROR_Constants.PC_GCPM_002, ...{ [ERROR_Constants.ERROR_DESC]: validationError } });
      };
      const place_details = await PlaceDetailsService.fetchPlaceDetails(params);

      return res.return(
        200,
        "SUCCESS",
        RequestDestination.PLACE_DETAILS_MAPPING,
        place_details
      );
    } catch (err) {
      logger.error(`Error in fetching place details : ${err}`);
      return res.error(500, 'SERVER_ERROR', RequestDestination.PLACE_DETAILS_MAPPING, { ...ERROR_Constants.PC_GCPM_001, ...{ [ERROR_Constants.ERROR_DESC]: err } });

    }
  };
}

