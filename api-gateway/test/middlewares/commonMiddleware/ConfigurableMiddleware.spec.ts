import { expect } from "chai";
import app from '../../../src/server'
import request from 'supertest';
import sinon from 'sinon';
import { LoginMiddleware } from '../../../src/middlewares/groupMiddlewares/LoginMiddleware';
import { LoggingMiddleware } from '../../../src/middlewares/groupMiddlewares/LoggingMiddleware';
import { ConfigurationHelper } from "../../../src/helper/configurationHelper";
import { Utils } from "../../../src/lib/Utils";
import {testData} from "../../config/data";

describe('Test Suite : Configurable Middleware', () => {

    beforeEach(async function () {
        const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
        delete configuration.groupMiddlewareMapping.emptyMappingGroup;
        configuration.groupMiddlewareMapping.emptyMappingGroup = {};
        // console.log('config',configuration.groupMiddlewareMapping)
        configuration.groupMiddlewareMapping['/iam/api/v1/user/auth/login/otp/verify'].Logging.active = true;
        sinon.restore();
    });

    // const sampleBody = {
    //     "mobile": "9999467489",
    //     "source": "insurance-dekho",
    //     "sub_source": "b2c",
    //     "name": "optional"
    // }

    it("should spy test on the Configurable Middleware successfully", function (done) {
        const spy1 = sinon.spy(LoginMiddleware, "execute");
        const spy2 = sinon.spy(LoggingMiddleware, "execute");

        request(app)
            .post('/iam/api/v1/user/auth/login/otp/verify')
            .set('Content-type', 'application/json')
            .expect('Content-Type', /json/)
            // .expect(200)
            // .send(sampleBody)
            .end((err, res) => {
                if (err) { return done(err); }
                // console.log('response',res.body)
                // console.log('spies', spy1, spy2, spy1.callCount, spy2.callCount);
                expect(spy1.called).to.be.true;
                expect(spy2.called).to.be.true;
                expect(spy1.threw()).to.be.false;
                expect(spy2.threw()).to.be.false;
                expect(spy1.callCount).to.be.equal(1);
                expect(spy2.callCount).to.be.equal(1);
                expect((spy1).calledAfter(spy2)).to.be.true;

                return done();
            });
    });

    // it("should throw error object for emptyMappingGroup", function (done) {


    //     request(app)
    //         .post('/emptyMappingGroup')
    //         .set('Content-type', 'application/json')
    //         .expect('Content-Type', /json/)
    //         .end((err, res) => {
    //             if (err) { return done(err); }
    //             console.log('response--->>',res.body);
    //             expect(res).to.be.an("object");
    //             expect(res).to.have.property('error')

    //             return done();
    //         });
    // });


    it("should throw error", async function () {
        const stub = sinon.stub(Utils, "isEmpty");
        request(app)
            .post('/iam/api/v1/user/auth/login/otp')
            .set('Content-type', 'application/json')
            .expect('Content-Type', /json/)
            // .expect(200)
            // .send(sampleBody)
            .end((err, res) => {

                expect(res).to.be.an("object");

                // return done();
            });

    });

});