import { expect } from 'chai'
import app from '../../../src/server'
import request from 'supertest';
import sinon from 'sinon';
import { LoggingMiddleware } from '../../../src/middlewares/groupMiddlewares/LoggingMiddleware';
import {ConfigurationHelper } from "../../../src/helper/configurationHelper";
import { testData } from "../../config/data";


describe('Test Suite : Logging Middleware', () => {

    before(async function () {
        const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
        configuration.groupMiddlewareMapping['iam'].Authentication.active = false;
        configuration.groupMiddlewareMapping['iam'].CorrelationIdGenerator.active = false;
        configuration.groupMiddlewareMapping['iam'].Logging.active = true;
        sinon.restore();
    });

    it("should spy test on Logging Middleware", function (done) {

        const spy1 = sinon.spy(LoggingMiddleware, "execute");
        const spy2 = sinon.spy(LoggingMiddleware, "logApiResponse");

        const spy1_body = {
            mobile: testData.mobile,
            source: testData.source,
            sub_source: testData.sub_source,
            name: testData.name
        }

        request(app)
            .get('/iam/api/v1/user/auth/login/otp')
            .expect('Content-Type', /json/)
            .send(spy1_body)
            .set(testData.headers)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(spy1.threw()).to.be.false;
                expect(spy1.called).to.be.true;
                expect(spy1.callCount).to.be.equal(1);
                expect(spy2.threw()).to.be.false;
                expect(spy2.called).to.be.true;
                expect(spy2.callCount).to.be.equal(1);
                expect((spy2).calledAfter(spy1)).to.be.true;

                return done();
            });
    });

});