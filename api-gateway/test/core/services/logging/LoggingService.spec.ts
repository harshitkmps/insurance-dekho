import chai from "chai";
const expect = chai.expect;
import chaiAsPromised from "chai-as-promised"; chai.use(chaiAsPromised);
import { mockRequest, mockResponse } from "mock-req-res";
import sinon from "sinon";
import { LoggingService } from "../../../../src/core/services/logging/LoggingService";

describe("Test: LoggingService()", () => {

    beforeEach(function () {
        sinon.restore();
    });

    it(" should log the request successfully ", async function () {

        const req = mockRequest();
        const res = mockResponse();
        const LogService = new LoggingService();
        const response: any = await LogService.createApiLog(req, res);
        // console.log('response==>', response);
        expect(response).to.exist;
        expect(response).to.be.an("object");
        expect(Object.keys(response)).to.have.lengthOf.at.least(1);

    });
});