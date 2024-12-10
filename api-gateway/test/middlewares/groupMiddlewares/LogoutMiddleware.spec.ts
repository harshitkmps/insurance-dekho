import { expect } from 'chai'
import app from '../../../src/server'
import request from 'supertest';
import sinon from 'sinon';
import { LogoutMiddleware } from '../../../src/middlewares/groupMiddlewares/LogoutMiddleware';
import { ConfigurationHelper } from "../../../src/helper/configurationHelper";
import { AuthenticationHelper } from '../../../src/helper/authenticationHelper';
import { testData } from "../../config/data";


describe('Test Suite : Logout Middleware', () => {

    before(async function () {
        const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
        configuration.groupMiddlewareMapping['/iam/api/v1/user/auth/logout'].Logging.active = true;
        configuration.groupMiddlewareMapping['/iam/api/v1/user/auth/logout'].CorrelationIdGenerator.active = true;
        configuration.groupMiddlewareMapping['/iam/api/v1/user/auth/logout'].Logout.active = true;
        sinon.restore();
    });

    it("should Logout the user", function (done) {
        request(app)
            .get("/iam/api/v1/user/auth/logout")
            .expect('Content-Type', /json/)
            .set(testData.headers)
            .end((err, res) => {
                if (err) { return done(err); }

                return done();
            });
    });


});