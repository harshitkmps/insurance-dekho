import { expect } from 'chai'
import app from '../../src/server'
import request from 'supertest';
import sinon from 'sinon';
import { ConfigurationService } from '../../src/core/services/configuration/ConfigurationService';
import { RedirectionService } from '../../src/core/services/redirection/redirectionService';



describe('Test Suite : Routes', () => {

    beforeEach(function () {
        sinon.restore();
    });
    const testConfig = {
        "middlewares": {
            "Authentication": {
                "active": true,
                "authType": {
                    "strict": ["/*"],
                    "both": [],
                    "skip": []
                },
                "token": ["cookie", "header"]
            },
            "Whitelisting": {
                "active": true
            },
            "Logging": {
                "active": false,
                "level": { "request": { "endpoint": 1, "httpMethod": 1, "header": 1, "body": 1 }, "response": { "endpoint": 1, "httpMethod": 1, "header": 1, "body": 1, "statusCode": 1, "callDuration": 1 } }
            },
            "correlationIdGenerator": {
                "header": "x-correlation-id",
                "minLength": 8,
                "maxLength": 20
            }
        },
        "absoluteRoutes": {
            "/iam/api/v1/user/auth/login/otp": { "allowedDomains": [], "outgoing": "http://localhost:8080/api/v1/user/auth/login/otp" },
            "/iam/api/v1/user/auth/login/otp/verify": { "allowedDomains": [], "outgoing": "http://localhost:8080/api/v1/user/auth/login/otp/verify" }
        },
        "urlGroups": {
            "iam": { "allowedDomains": [], "outgoing": "http://localhost:8080" }
        },
        "preDefaultMiddlewares": {
            "correlationIdGenerator": {},
            "Logging": {}
        },
        "postDefaultMiddlewares": {},
        "groupMiddlewareMapping": {
            "iam": {
                "Whitelisting": {},
                "Authentication": {
                    "active": true,
                    "authType": {
                        "strict": [],
                        "both": [],
                        "skip": []
                    }
                }
            },
            "/iam/api/v1/user/auth/login/otp": {
                correlationIdGenerator: { header: 'x-correlation-id', minLength: 8, maxLength: 20 },
                Logging: { active: false, level: { request: [Object], response: [Object] } },
                Whitelisting: { active: true },
                Authentication: {
                    active: true,
                    authType: { strict: [], both: [], skip: [] },
                    token: ['cookie', 'header']
                }
            },
            "/iam/api/v1/user/auth/login/otp/verify": {
                "Whitelisting": {},
                "Authentication": {
                    "active": true,
                    "authType": {
                        "strict": [],
                        "both": ["/api/v1/user/auth/login/otp/verify"],
                        "skip": []
                    }
                }
            }
        }
    };


    describe('Redis Configuration Routes', () => {

        describe('Set Configuration Route', () => {

            beforeEach(function () {
                sinon.restore();
            });

            it(' should set the Configuration ', function (done) {

                request(app)
                    .post('/api/v1/configuration/')
                    .send(testConfig)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        // console.log('++++++++++++++>>>',res.body);
                        expect(res).to.exist;
                        expect(res.body).to.be.an('object');
                        expect(res.body.data).to.be.an('object');
                        expect(res.body.data.message).to.be.a('string');
                        expect(res.body.data.message).to.be.equal('Configuration has been updated successfully');
                        return done();
                    });
            });

            it(' should throw error ', function (done) {

                const stub = sinon.stub(ConfigurationService.prototype, "setConfiguration").throws(Error);
                request(app)
                    .post('/api/v1/configuration/')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res: any) => {
                        // console.log('=====>>', res.body);
                        expect(res).to.be.an("object");
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.all.keys("errors");
                        expect(res.body.errors).to.be.an("array");
                        expect(res.body.errors[0]).to.be.an("object");
                        expect(res.body.errors[0]).to.have.all.keys("code", "message", "error");
                        expect(res.body.errors[0].code).to.be.a("string");
                        expect(res.body.errors[0].code).to.be.equal("CONF002");
                        expect(res.body.errors[0].message).to.be.a("string");
                        expect(res.body.errors[0].error).to.be.a("object");

                        return done();
                    });
            });

        });

        describe('Get Configuration Route', () => {

            beforeEach(function () {
                sinon.restore();
            });


            it(' should fetch the Configuration ', function (done) {

                request(app)
                    .get('/api/v1/configuration/')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        // console.log('=====>>', res.body);
                        expect(res).to.exist;
                        expect(res.body).to.be.an('object');
                        return done();
                    });
            });

            it(' should throw error ', function (done) {

                const stub = sinon.stub(ConfigurationService.prototype, "getConfiguration").throws(Error);
                request(app)
                    .get('/api/v1/configuration/')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res: any) => {
                        // console.log('=====>>', res.body);
                        expect(res).to.be.an("object");
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.all.keys("errors");
                        expect(res.body.errors).to.be.an("array");
                        expect(res.body.errors[0]).to.be.an("object");
                        expect(res.body.errors[0]).to.have.all.keys("code", "message", "error");
                        expect(res.body.errors[0].code).to.be.a("string");
                        expect(res.body.errors[0].code).to.be.equal("CONF001");
                        expect(res.body.errors[0].message).to.be.a("string");
                        expect(res.body.errors[0].error).to.be.a("object");

                        return done();
                    });
            });

        });

    });

    describe('Group Route : /group', () => {

        beforeEach(function () {
            sinon.restore();
        });


        // it('should check for group:iam route /iam', function (done) {

        //     request(app)
        //         .get('/api/v1/group/iam')
        //         .expect('Content-Type', /json/)
        //         .expect(200)
        //         .end((err, res) => {
        //             // console.log('==>>',res.body);
        //             expect(res).to.exist;
        //             expect(res.body).to.be.an('object');
        //             return done();
        //         });
        // });

        // it('should throw error', function (done) {

        //     const stub = sinon.stub(RedirectionService.prototype,"redirect").rejects("TypeError");

        //     request(app)
        //         .get('/api/v1/group/iam')
        //         .expect('Content-Type', /json/)
        //         // .expect(200)
        //         .end((err, res) => {
        //             console.log('==>>',res.body);
        //             // expect(res).to.exist;
        //             // expect(res.body).to.be.an('object');
        //             return done();
        //         });
        // });


    });

    describe('Absolute Route : /otp/login route', () => {

        it('should check for absolute route route ', function (done) {

            request(app)
                .post('/iam/api/v1/user/auth/login/otp')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    // console.log('==>>',res);
                    expect(res).to.exist;
                    expect(res.body).to.be.an('object');
                    return done();
                });
        });
    });



});




/**
 * self-notes
 * for configuration routes how to get inside .catch((Ex) => { next({ data: Ex }); for ut purpose
 */