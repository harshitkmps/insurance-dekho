/**
 * Author - Ankit Shukla
 * First Test Case File Using Jest ;)
 */

import loggerService from "@services/LoggerService";

// testcases to be executed
const testCases = [
    {   INPUT   : { error : 'area', },      EXPECTATION : true,     }, 
    {   INPUT   : [ 'abc', 'cde' ],         EXPECTATION : true,     }, 
    {   INPUT   : 'string is not allwoed',  EXPECTATION : true,     }, 
    {   INPUT   : 12345 ,                   EXPECTATION : true,     }, 
];

// running isolated test cases
const executeLoggerServiceTest = async () => {

    for(const testCase of testCases) {
    
        // run test case
        test('testing logger service', async () => {
    
            // testcase execution
            expect(await loggerService.generateErrorLog(
                    testCase.INPUT
                ).then((res) => {
                    return (res) ? true : false;
                }, (err) => {
                    return false;
                })
            )
            .toEqual(testCase.EXPECTATION);
        });
    }
}

export default { executeLoggerServiceTest }
