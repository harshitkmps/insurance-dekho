/**
 * Author - Ankit Shukla
 * First Test Case File Using Jest ;)
 */

import mocker from "./Mocker.test";
import PincodeServiceTest from "@tests/PincodeService.test";
import loggerServiceTest from "@tests/LoggerService.test";

// set timout for whole testing execution time
jest.setTimeout(10000);

beforeAll(() => {
    // mocking db query
    mocker.apiLogMocker.mockReturnValue(Promise.resolve(true));
    mocker.errorLogMocker.mockReturnValue(Promise.resolve(true));
    mocker.tpApiLogMocker.mockReturnValue(Promise.resolve(true));
    mocker.unhandledErrorLogMocker.mockReturnValue(Promise.resolve(true));
})

// tests to be execited
loggerServiceTest.executeLoggerServiceTest();
// PincodeServiceTest.executePincodeServiceTest();

// to be run after executing all testcases.
afterAll(async () => {
    return;
});