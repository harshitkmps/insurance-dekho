/**
 * Author   -   Ankit Shukla
 */

const router = require('express').Router({
    caseSensitive: true,
    strict: true
});

import { pincodeController } from '@app/controllers/PincodeController';
import geocodingController from '@controllers/GeocodingController';
import {SuggestionsController , PlaceDetailsController}from '@app/controllers/SuggestionsController';
import IPController from '@app/controllers/IPController';

router.get(
    '/geo-reverse-coding',
    geocodingController.geoCoding
);

// router.get(
//     '/getDistanceBetweenPinCodeToPincode',
//     pincodeController.getDistanceAndTimeBtwPincodes
// );

router.get(
    "/autocomplete-suggestions", 
    SuggestionsController.Suggestions
);
router.get(
    "/place-details", 
   PlaceDetailsController.PlaceDetails
);

router.post(
    '/ip-info',
    IPController.IPInfo
)
router.get(
    '/fetch-pincode-list-in-distance-range',
  pincodeController.pincodesList
)
router.get(
    '/fetch-distance-and-time-between-pincodes',
    pincodeController.getDistanceAndTimeBtwPincodeForSingleDestination
)
export default {
    router: router
};