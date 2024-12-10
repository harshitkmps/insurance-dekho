import chai from "chai";
const expect = chai.expect;
import { mockRequest, mockResponse } from "mock-req-res";
import chaiAsPromised from "chai-as-promised"; chai.use(chaiAsPromised);
import sinon from "sinon";
import { ThirdPartyService } from "../../../../src/core/services/common/ThirdPartyService";
import request from "request";
import { Utils } from "../../../../src/lib/Utils";

describe(" Test Suite : ThirdPartyServices ", () => {


    describe("Test: commonRequest()", () => {

        beforeEach(function () {
            sinon.restore();
        });

        it(" should hit the specified GET request successfully ", async function () {

            const tps = new ThirdPartyService();
            const req = mockRequest({ headers: { "x-api-key": "randomString" } });
            const res = mockResponse();
            const response = await tps.commonRequest(req, res, "http://localhost:7200/api/v1/configuration/serverHealth");
            // console.log('response===>', response);
            expect(response).to.exist;
            expect(response).to.be.an("object");

        });

        it(" should hit the specified POST request successfully ", async function () {

            const tps = new ThirdPartyService();
            const req = mockRequest({ headers: { "x-api-key": "randomString", "Content-Type": "multipart/form-data" } });
            req.method = "POST";
            // req.header = {"Content-Type":"multipart/form-data"}; //req.get issue
            const res = mockResponse();
            const response: any = await tps.commonRequest(req, res, "http://localhost:8080/iam/api/v1/user/auth/login/otp");
            // console.log('response===>', response);
            // console.log('error===>', response.err);
            // console.log('body===>', response.err.body);
            // expect(response).to.exist;
            // expect(response).to.be.an("object");

        });
    });

    describe("Test: getRequest()", () => {

        beforeEach(function () {
            sinon.restore();
        });

        it(" should hit the given GET request successfully ", async function () {

            const tps = new ThirdPartyService();
            const req = mockRequest();
            const res = mockResponse();
            const response = await tps.getRequest(req, res, "http://localhost:7200/api/v1/configuration/serverHealth");
            // console.log('response===>',response);
            expect(response).to.exist;
            expect(response).to.be.an("object");

        });

        it(" should throw error", async function () {

            const req = mockRequest();
            const res = mockResponse();
            const stub = sinon.stub(Utils, "isEmpty").throws(Error);
            const tps = new ThirdPartyService();
            const response = await expect(tps.getRequest(req, res, "http://localhost:7200/api/v1/configuration/serverHealth")).to.be.rejected;
            // console.log('response===>',response);
            expect(response).to.be.an("error");

        });

        it(" should throw error when get request is stubbed", async function () {

            const req = mockRequest();
            const res = mockResponse();
            const stub = sinon.stub(request, "get").throws(Error);
            const tps = new ThirdPartyService();
            const response: any = await tps.getRequest(req, res, "http://localhost:7200/api/v1/configuration/serverHealth");
            // console.log('response===>',response);
            // console.log('error===>',response.error);
            // console.log('body===>',response.error.body);
            expect(response).to.be.an("object");
            expect(response).to.have.all.keys("error");
            expect(response.error).to.have.all.keys("status", "body");
            expect(response.error.status).to.be.a("number");
            expect(response.error.status).to.be.equal(500);
            expect(response.error.body).to.be.an("array");
            expect(response.error.body[0]).to.be.an("object");
            expect(response.error.body[0]).to.have.all.keys("code", "message", "error");
            expect(response.error.body[0].code).to.be.a("string");
            expect(response.error.body[0].code).to.be.equal("TPS003");
            expect(response.error.body[0].message).to.be.a("string");
            expect(response.error.body[0].message).to.be.equal("Code Error in TPS GET Request");
            expect(response.error.body[0].error).to.be.a("object");
            expect(response.error.body[0].error).to.have.all.keys("body");
            expect(response.error.body[0].error.body).to.be.an("error");

        });
    });

    describe("Test: postRequest()", () => {

        beforeEach(function () {
            sinon.restore();
        });

        it(" should hit the given POST request successfully ", async function () {
            const req = mockRequest({ headers: { "Content-Type": "application/json" } });
            const res = mockResponse();
            const tps = new ThirdPartyService();
            const response: any = await tps.postRequest(req, res, "http://localhost:8080/iam/api/v1/user/auth/login/otp");
            // console.log('response===>',response);
            // console.log('error===>', response.err);
            // console.log('body===>', response.err.body);
            expect(response).to.be.an("object");
            expect(response).to.have.all.keys("err");
            expect(response.err).to.be.an("object");
            expect(response.err).to.have.all.keys("status", "body");
            expect(response.err.status).to.be.a("number");
            expect(response.err.status).to.be.equal(500);
            expect(response.err.status).to.be.a("number");
            expect(response.err.body).to.be.an("array");
            expect(response.err.body[0]).to.have.all.keys("code", "message", "error");
            expect(response.err.body[0].code).to.be.a("string");
            expect(response.err.body[0].code).to.be.equal("TPS001");
            expect(response.err.body[0].message).to.be.a("string");
            expect(response.err.body[0].message).to.be.equal("Body is empty in the response");
            expect(response.err.body[0].error).to.be.a("object");
            expect(response.err.body[0].error).to.have.all.keys("body");
            expect(response.err.body[0].error.body).to.be.an("string");
            expect(response.err.body[0].error.body).to.be.equal("No body is present in the response of the POST API Call");

        });

        it(" should hit the given POST request successfully when formData is provided", async function () {
            const req = mockRequest({ body: { "utKey": "testing" } });
            const res = mockResponse();
            const tps = new ThirdPartyService();
            const response: any = await tps.postRequest(req, res, "http://localhost:8080/iam/api/v1/user/auth/login/otp", true);
            // console.log('response===>',response);
            // expect(response).to.be.an("object");

        });

        it(" should throw error", async function () {

            const req = mockRequest();
            const res = mockResponse();
            const stub = sinon.stub(Utils, "isEmpty").throws(Error);
            const tps = new ThirdPartyService();
            const response = await expect(tps.postRequest(req, res, "http://localhost:8080/iam/api/v1/user/auth/login/otp")).to.be.rejected;
            // console.log('response===>',response);
            expect(response).to.be.an("error");

        });

        it(" should throw error when post request is stubbed", async function () {

            const req = mockRequest();
            const res = mockResponse();
            const stub = sinon.stub(request, "post").throws(Error);
            const tps = new ThirdPartyService();
            const response: any = await tps.postRequest(req, res, "http://localhost:7200/api/v1/configuration/");
            // console.log('response===>',response);
            // console.log('error===>',response.error);
            // console.log('body===>',response.error.body);
            expect(response).to.be.an("object");
            expect(response).to.have.all.keys("error");
            expect(response.error).to.have.all.keys("status", "body");
            expect(response.error.status).to.be.a("number");
            expect(response.error.status).to.be.equal(500);
            expect(response.error.body).to.be.an("array");
            expect(response.error.body[0]).to.be.an("object");
            expect(response.error.body[0]).to.have.all.keys("code", "message", "error");
            expect(response.error.body[0].code).to.be.a("string");
            expect(response.error.body[0].code).to.be.equal("TPS003");
            expect(response.error.body[0].message).to.be.a("string");
            expect(response.error.body[0].message).to.be.equal("Code Error in TPS POST Request");
            expect(response.error.body[0].error).to.be.a("object");
            expect(response.error.body[0].error).to.have.all.keys("body");
            expect(response.error.body[0].error.body).to.be.an("error");

        });

    });

});


/**
 * selfNotes:
 *  can error object's structure be simplified (ex in case of get request)
 *  check get function  coverage , can we remove upper level of try,catch
 *  check post function coverage
 *  req.get("Content-Type") in commonRequest , can we use req.headers["Content-Type"]
 */