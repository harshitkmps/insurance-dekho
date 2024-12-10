/**
 * Author   -   Ankit Shukla
 */

import { assert, validate, is } from 'superstruct'
import validations from '@validations/ValidationRules';

export default {
    validate: (ruleType: string, value: any) => {
        let rule: any;
        switch (ruleType) {

            case validations.rules.geoCodingValidationRule:
                rule = validations.geoCodingValidationRule;
                break;
            case validations.rules.autocompleteSuggestionsValidationRule:
                rule = validations.autocompleteSuggestionsValidationRule;
                break;
            case validations.rules.placeDetailsValidationRule:
                rule=validations.placeDetailsValidationRule;
                break;    
            case validations.rules.pincodeValidationRule:
                rule = validations.pincodeValidationRule;
                break;
            default:
                break;
        };
        try {
            assert(value, rule);
        } catch (e: any) {
            return e.refinement ? e.refinement : `Key '${e.path}' expected a '${e.type}' but received '${e.value}'`;
        };
    },
}

