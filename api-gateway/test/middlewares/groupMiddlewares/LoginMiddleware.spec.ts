import { expect } from 'chai'
import app from '../../../src/server'
import request from 'supertest';
import sinon from 'sinon';
import { LoginMiddleware } from '../../../src/middlewares/groupMiddlewares/LoginMiddleware';
import { ConfigurationHelper } from "../../../src/helper/configurationHelper";

describe('Test Suite : Login Middleware', () => {

    before(async function () {
        const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
        configuration.groupMiddlewareMapping['/iam/api/v1/user/auth/login/otp/verify'].Logging.active = false;
        configuration.groupMiddlewareMapping['/iam/api/v1/user/auth/login/otp/verify'].Login.active = true;
        configuration.groupMiddlewareMapping['/iam/api/v1/user/auth/login/otp/verify'].CorrelationIdGenerator.active = false;
        sinon.restore();
    });

    const body = {
        mobile : "9999467488",
        source : "insurance-dekho",
        sub_source : "b2c",
        otp : 667610
    }

    it("should spy test on Login Middleware", function (done) {

        const spy1 = sinon.spy(LoginMiddleware, "execute");

        request(app)
            .post("/iam/api/v1/user/auth/login/otp/verify")
            .expect('Content-Type', /json/)
            .send(body)
            // .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                // console.log('response---->', spy1.callCount, spy1.threw());
                expect(spy1.threw()).to.be.false;
                expect(spy1.called).to.be.true;
                expect(spy1.callCount).to.be.equal(1);
                return done();
            });
    });

});