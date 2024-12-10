import { expect } from 'chai'
import app from '../../../src/server'
import request from 'supertest';
import sinon from 'sinon';
import { CorrelationIdGeneratorMiddleware } from '../../../src/middlewares/groupMiddlewares/CorrelationIdGeneratorMiddleware';
import { ConfigurationHelper } from "../../../src/helper/configurationHelper";
import { testData } from "../../config/data";

describe('Test Suite : correlationIdGenerator Middleware', () => {

    before(async function () {
        const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
        configuration.groupMiddlewareMapping['iam'].CorrelationIdGenerator.active = true;
        sinon.restore();
    });

    it("should spy test on CorrelationIdGenerator Middleware", function (done) {

        const spy1 = sinon.spy(CorrelationIdGeneratorMiddleware, "execute");

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

});