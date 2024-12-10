/**
 * Author   -   Ankit Shukla
 */

import _, { isNaN } from 'lodash';
import validationRefiners from '@validations/ValidationRefinery';
import { type, object, number, string, define, refine } from 'superstruct';

export default {
    rules : {
        geoCodingValidationRule: "geoCodingValidationRule",
        autocompleteSuggestionsValidationRule:"autocompleteSuggestionsValidationRule",
        placeDetailsValidationRule:"placeDetailsValidationRule",
        pincodeValidationRule:"pincodeValidationRule",
    },

    geoCodingValidationRule : type({
        latlng : string()
        }),
    autocompleteSuggestionsValidationRule: object({
        input: refine(string(), 'minLength', (value) => value.length >= 1),
        location: string()
    }),
    placeDetailsValidationRule: type({
        place_id: string()
    }),
    pincodeValidationRule: object({
        pincode: refine(string(), 'Invalid Pincode', (value) => value.length == 6 && /^\d+$/.test(value))
    }),


}