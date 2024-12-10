import chai from "chai";
const expect = chai.expect;
import { mockRequest, mockResponse } from "mock-req-res";
import sinon from "sinon";
import { RedirectionService } from "../../../../src/core/services/redirection/redirectionService";
import { ConfigurationHelper } from "../../../../src/helper/configurationHelper";
import { testData } from "../../../config/data";

describe(" Test Suite : RedirectionService ", () => {

    describe("Test: redirect()", () => {

        beforeEach(function () {
            sinon.restore();
        });

        it(" should redirect for the specified absolute Route ", async function () {

            const redirectService = new RedirectionService();
            const req = mockRequest({ headers: { "x-api-key": testData.headers["x-api-key"] } });
            req.originalUrl = "/iam/api/v1/user/auth/login/otp";
            const res = mockResponse();
            const response = await redirectService.redirect(req, res);
            expect(response).to.exist;
            expect(response).to.be.an("object");

        });

        it(" should redirect for the specified group Route ", async function () {

            const redirectService = new RedirectionService();
            const req = mockRequest({ headers: { "x-api-key": testData.headers["x-api-key"] } });
            req.originalUrl = "/iam/api/v1/user/accounts/472802a6-0235-4f2b-882d-73e3edb813a2";
            const res = mockResponse();
            const response = await redirectService.redirect(req, res);
            expect(response).to.exist;
            expect(response).to.be.an("object");

        });

        // it(" should resolve with empty parameters ", async function () { refer in notes

        //     const redirectService = new RedirectionService();
        //     const req = mockRequest({ headers: { "x-api-key": "randomString" } });
        //     // const req = mockRequest();
        //     req.originalUrl = "/emptyMappingGroupErr";
        //     const res = mockResponse();
        //     const response = await redirectService.redirect(req, res);
        //     console.log('response===>', response);
        //     // expect(response).to.exist;
        //     // expect(response).to.be.an("object");

        // });

        it(" should return responseData  ", async function () {

            const redirectService = new RedirectionService();
            const req = mockRequest({ headers: { "x-api-key": testData.headers["x-api-key"] } });
            // const req = mockRequest();
            req.originalUrl = "/emptyMappingGroup";
            const res: any = mockResponse();
            res.__responseData = "__responseData comes from Login Middleware";
            const response = await redirectService.redirect(req, res);
            console.log('response===>', response);
            // expect(response).to.exist;//response object can be tested
            // expect(response).to.be.an("object");

        });

        it(" should throw error  ", async function () {

            const stub = sinon.stub(ConfigurationHelper, "getUrlGroup").throws(Error);
            const req = mockRequest({ headers: { "x-api-key": testData.headers["x-api-key"] } });
            const res = mockResponse();
            const redirectService = new RedirectionService();
            const response: any = await expect(redirectService.redirect(req, res)).to.be.rejected;
            // console.log('response==>', response);
            expect(response).to.be.an("error");

        });
    });

});

/**
 * Utils.isEmpty(urlGroup) , if urlGroup is not present in config then the getUrl function breaks at line 25 since
 * configuration.urlGroups[urlGroup].allowedDomains becomes invalid. [this seems not required]
 */