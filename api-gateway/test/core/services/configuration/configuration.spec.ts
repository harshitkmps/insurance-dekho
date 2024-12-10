import chai from "chai";
const expect = chai.expect;
import { mockRequest, mockResponse } from "mock-req-res";
import { RedisClient } from "../../../../src/config/database/redisClient";
import sinon from "sinon";
import { ConfigurationService } from "../../../../src/core/services/configuration/ConfigurationService";
import { testData } from "../../../config/data";

describe(" Test Suite : ConfigurationServices ", () => {

    describe("Test: setConfiguration()", () => {

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
                    "active": true,
                    "level": { "request": { "endpoint": 1, "httpMethod": 1, "header": 1, "body": 1 }, "response": { "endpoint": 1, "httpMethod": 1, "header": 1, "body": 1, "statusCode": 1, "callDuration": 1 } }
                },
                "Login": {
                    "active": false,
                },
                "Logout": {
                    "active": false,
                },
                "CorrelationIdGenerator": {
                    "active" : true,
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
                "iam": { "allowedDomains": [], "outgoing": "http://localhost:8080" },
                "emptyMappingGroup": { "allowedDomains": [], "outgoing": "http://localhost:8080" },
            },
            "preDefaultMiddlewares": {
                "CorrelationIdGenerator": {},
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
                    },
                    "Login": {
                        "active": false
                    }
                },
                "/iam/api/v1/user/auth/login/otp": {
                    "Authentication": {
                        "active": true,
                        "authType": {
                            "strict": [],
                            "both": [],
                            "skip": ["/api/v1/user/auth/login/otp"]
                        }
                    },
                    "Login": {
                        "active": false
                    },
                    "Logout": {
                        "active": false
                    }
                },
                "/iam/api/v1/user/auth/login/otp/verify": {
                    "Authentication": {
                        "active": true,
                        "authType": {
                            "strict": [],
                            "both": ["/api/v1/user/auth/login/otp/verify"],
                            "skip": []
                        }
                    }
                },
                "emptyMappingGroup": {}
            }
        };

        const tempData = {

            groupMiddlewareMapping: {
                iam: {
                    CorrelationIdGenerator: [Object],
                    Logging: [Object],
                    Whitelisting: [Object],
                    Authentication: [Object]
                },
                '/iam/api/v1/user/auth/login/otp': {
                    CorrelationIdGenerator: { header: 'x-correlation-id', minLength: 8, maxLength: 20 },
                    Logging: { active: false, level: { request: [Object], response: [Object] } },
                    Whitelisting: { active: true },
                    Authentication: {
                        active: true,
                        authType: { strict: [], both: [], skip: ['/api/v1/user/auth/login/otp'] },
                        token: ['cookie', 'header']
                    }
                },
                '/iam/api/v1/user/auth/login/otp/verify': {
                    CorrelationIdGenerator: [Object],
                    Logging: [Object],
                    Whitelisting: [Object],
                    Authentication: [Object]
                }
            }
        }

        it(" should set the configuration into Redis successfully ", async function () {

            const req = mockRequest({ body: testData.configuration });
            const res = mockResponse();
            const ConfService = new ConfigurationService();
            const response = await ConfService.setConfiguration(req, res);
            // console.log('response===>',response);
            expect(response).to.be.an("object");
            expect(Object.keys(response)).to.have.lengthOf.at.least(1);
            expect(response).to.have.all.keys("message");
            expect(response.message).to.be.a("string");

        });

        it("should throw error ", async function () {

            const stub = sinon.stub(RedisClient.prototype, "setRedisData").throws(Error);
            const req = mockRequest();
            const res = mockResponse();
            const ConfService = new ConfigurationService();
            const response = await expect(ConfService.setConfiguration(req, res)).to.be.rejected;
            // console.log('++>',response);
            expect(response).to.be.an("error");

        });
    });

    describe("Test: getConfiguration()", () => {

        beforeEach(function () {
            sinon.restore();
        });

        it(" should fetch the configuration from  Redis successfully ", async function () {

            const req = mockRequest();
            const res = mockResponse();
            const ConfService = new ConfigurationService();
            const response = await ConfService.getConfiguration(req, res);
            // console.log('response==>',response);
            expect(response).to.be.an("object");
            expect(Object.keys(response)).to.have.lengthOf.at.least(1);
            // expect(response).to.have.all.keys("middlewares", "absoluteRoutes", "urlGroups", "preDefaultMiddlewares", "postDefaultMiddlewares", "groupMiddlewareMapping", "updatedAt");
            // expect(response.middlewares).to.be.an("object");
            // expect(response.absoluteRoutes).to.be.an("object");
            // expect(response.urlGroups).to.be.an("object");
            // expect(response.groupMiddlewareMapping).to.be.an("object");
            // expect(response.preDefaultMiddlewares).to.be.an("object");
            // expect(Object.keys(response.preDefaultMiddlewares)).to.have.lengthOf.at.least(1);
            // expect(response.preDefaultMiddlewares).to.have.all.keys("correlationIdGenerator", "Logging");
            // expect((response.preDefaultMiddlewares).correlationIdGenerator).to.be.an("object");
            // expect((response.preDefaultMiddlewares).Logging).to.be.an("object");
            // expect(response.postDefaultMiddlewares).to.be.an("object");
            // expect(response.updatedAt).to.be.a("date");

        });
    });

});
