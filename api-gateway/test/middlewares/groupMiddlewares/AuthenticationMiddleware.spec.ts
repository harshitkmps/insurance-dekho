import { expect } from 'chai'
import app from '../../../src/server'
import request from 'supertest';
import sinon from 'sinon';
import { AuthenticationMiddleware } from '../../../src/middlewares/groupMiddlewares/AuthenticationMiddleware';
import {ConfigurationHelper } from "../../../src/helper/configurationHelper";
import { AuthenticationHelper } from '../../../src/helper/authenticationHelper';
import { testData } from "../../config/data";

describe('Test Suite : Authentication Middleware', () => {

    beforeEach(async function () {
        const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
        configuration.groupMiddlewareMapping['iam'].Authentication.active = true;
        configuration.groupMiddlewareMapping['iam'].Logging.active = false;
        configuration.groupMiddlewareMapping['iam'].CorrelationIdGenerator.active = false;

        sinon.restore();
    });

    it("should spy test on Authentication Middleware for send-otp", function (done) {

        const spy1 = sinon.spy(AuthenticationMiddleware, "execute");

        const spy1_body = {
            mobile: testData.mobile,
            source: testData.source,
            sub_source: testData.sub_source,
            name: testData.name
        }

        request(app)
            .post('/iam/api/v1/user/auth/login/otp')
            .expect('Content-Type', /json/)
            .send(spy1_body)
            .set(testData.headers)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(spy1.threw()).to.be.false;
                expect(spy1.called).to.be.true;
                expect(spy1.callCount).to.be.equal(1);
                return done();
            });
    });

    it("should throw error in send otp", function (done) {

        const stub = sinon.stub(AuthenticationHelper, "getAuthType").throws(Error);

        const spy2_body = {
            mobile: testData.mobile,
            source: testData.source,
            sub_source: testData.sub_source,
            name: testData.name
        }

        request(app)
            .post('/iam/api/v1/user/auth/login/otp')
            .expect('Content-Type', /json/)
            .send(spy2_body)
            .set(testData.headers)
            .end((err, res) => {
                if (err) { return done(err); }
                return done();
            });
    });

    it("should execute getUser API for strict type checking", function (done) {
        request(app)
            .get("/iam/api/v1/user/accounts/472802a6-0235-4f2b-882d-73e3edb813a2")
            .expect('Content-Type', /json/)
            .set(testData.headers)
            .end((err, res) => {
                if (err) { 
                    return done(err); 
                }
                return done();
            });
    });

});