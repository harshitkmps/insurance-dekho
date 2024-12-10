/**
 * Author - Ankit Shukla
 * First Test Case File Using Jest ;)
 */

import PincodeService from "@services/PincodeService";
import thirdPartyConfig from "@app/config/services/ThirdPartyConfig";
import Constants from "@app/utils/constants/Constants";
import CommonHelper from "@helpers/CommonHelper";
import mocker from "@tests/Mocker.test";
const currentTime = CommonHelper.getDateTime();

// testcases to be executed
const testCases = [
    {   INPUT: { groupBy : 'area',   limit :"-1", pincode : "110059" },  
        BROKERAGE_API_MOCK  : {
            "data": {
                "110059": {
                    "cityId": 49,
                    "cityName": "New Delhi",
                    "stateId": 10,
                    "stateName": "Delhi",
                    "areas": [
                        "D. K. Mohan Garden",
                        "Hastal Village",
                        "Jeevan Park",
                        "Matiala",
                        "Uttam Nagar"
                    ]
                }
            }
        },    
        EXPECTATION: true,
    }, 
    {   INPUT       : { groupBy : 'area',   limit :"-1", pincode : "abc"    },  
        BROKERAGE_API_MOCK : {
            "errors": [
                {
                    "code": "PMV1",
                    "message": "pincode must be a number",
                    "detail": "pincode must be a number",
                    "displayMessage": "pincode must be a number",
                    "errCategory": "GIBPL-error"
                }
            ]
        },
        EXPECTATION: false,    
    }, 
    {   INPUT       : { groupBy : 'abcxyz', limit :"-1", pincode : "110059" },  
        BROKERAGE_API_MOCK : {
            "data": [
                {
                    "cityId": 49,
                    "cityName": "New Delhi",
                    "displayName": "New Delhi",
                    "citySLug": "new-delhi",
                    "stateId": 10,
                    "stateName": "Delhi",
                    "pincode": 110059,
                    "areaName": "Hastal Village",
                    "postOffice": "Hastal Village",
                    "isMetroCity": false
                }
            ]
        },
        EXPECTATION: true,     
    }, 
    {   INPUT       : { groupBy : 'area',   limit :"-5", pincode : "380001" },  
        BROKERAGE_API_MOCK : {
            "errors": [
                {
                    "code": "PMV1",
                    "message": "limit must be larger than or equal to -1",
                    "detail": "limit must be larger than or equal to -1",
                    "displayMessage": "limit must be larger than or equal to -1",
                    "errCategory": "GIBPL-error"
                }
            ]
        }, 
        EXPECTATION: false,   
    },
];

// running isolated test cases
const executePincodeServiceTest = async () => {

    for(const testCase of testCases) {
    
        // run test case
        test('testing pincode service', async () => {
            mocker.httpRequestMocker.mockReturnValue(Promise.resolve(testCase.BROKERAGE_API_MOCK));
            // testcase execution
            expect(await PincodeService.getCityPincodeMapping({
                    headers     : thirdPartyConfig.BROKERAGE.HEADERS,
                    body        : {},
                    query       : testCase.INPUT,
                    method      : Constants.REQUEST.METHOD.GET,
                    url         : `${process.env.BROKERAGE_BASE_URL}/${thirdPartyConfig.BROKERAGE.END_POINTS.PINCODE}`,
                    response    : "",
                    created_at  : currentTime,
                    updated_at  : currentTime,
                }).then((res) => {
                    return (res && res.data && res.data.data) ? true : false;
                }, (err) => {
                    return false;
                })
            )
            .toEqual(testCase.EXPECTATION);
        });
    }
}

export default { executePincodeServiceTest }
