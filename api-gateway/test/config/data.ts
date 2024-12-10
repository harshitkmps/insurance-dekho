let configuration :any = {
    "middlewares": {
        "Authentication": {
            "active": true,
            "authType": {
                "strict": [],
                "both": [],
                "skip": []
            },
            "token": {
                "type": "cookie",
                "key": "authToken"
            }
        },
        "Logging": {
            "active": false,
            "level": {
                "request": {
                    "endpoint": 1,
                    "httpMethod": 1,
                    "header": 1,
                    "body": 1
                },
                "response": {
                    "endpoint": 1,
                    "httpMethod": 1,
                    "header": 1,
                    "body": 1,
                    "statusCode": 1,
                    "callDuration": 1,
                    "resBody": true
                }
            }
        },
        "CorrelationIdGenerator": {
            "active": false,
            "header": "x-correlation-id"
        },
        "Login": {
            "active": false,
            "token": {
                "type": "cookie",
                "key": "authToken",
                "properties": {
                    "domain": ".insurancedekho.com",
                    "httpOnly": true,
                    "secure": true
                }
            }
        },
        "Logout": {
            "active": false
        }
    },
    "absoluteRoutes": {
        "/iam/api/v1/user/auth/logout": {
            "allowedDomains": [],
            "outgoing": "http://localhost:8080/api/v1/user/auth/logout"
        },
        "/iam/api/v1/user/auth/login/otp/verify": {
            "allowedDomains": [],
            "outgoing": "http://localhost:8080/api/v1/user/auth/login/otp/verify"
        }
    },
    "urlGroups": {
        "iam": {
            "allowedDomains": [],
            "outgoing": "http://localhost:8080"
        },
        "emptyMappingGroup": {
            "allowedDomains": [],
            "outgoing": "http://localhost:8080"
        },
    },
    "groupMiddlewareMapping": {
        "iam": {
            "CorrelationIdGenerator": {
                "active": false,
                "header": "x-correlation-id"
            },
            "Logging": {
                "active": false,
                "level": {
                    "request": {
                        "endpoint": 1,
                        "httpMethod": 1,
                        "header": 1,
                        "body": 1
                    },
                    "response": {
                        "endpoint": 1,
                        "httpMethod": 1,
                        "header": 1,
                        "body": 1,
                        "statusCode": 1,
                        "callDuration": 1,
                        "resBody": true
                    }
                }
            },
            "Authentication": {
                "active": true,
                "authType": {
                    "strict": [],
                    "both": [],
                    "skip": [
                        "/api/v1/user/auth/login/otp"
                    ]
                },
                "token": {
                    "type": "cookie",
                    "key": "authToken"
                }
            }
        },
        "/iam/api/v1/user/auth/login/otp/verify": {
            "CorrelationIdGenerator": {
                "active": false,
                "header": "x-correlation-id"
            },
            "Logging": {
                "active": false,
                "level": {
                    "request": {
                        "endpoint": 1,
                        "httpMethod": 1,
                        "header": 1,
                        "body": 1
                    },
                    "response": {
                        "endpoint": 1,
                        "httpMethod": 1,
                        "header": 1,
                        "body": 1,
                        "statusCode": 1,
                        "callDuration": 1,
                        "resBody": true
                    }
                }
            },
            "Login": {
                "active": true,
                "token": {
                    "type": "cookie",
                    "key": "authToken",
                    "properties": {
                        "domain": ".insurancedekho.com",
                        "httpOnly": true,
                        "secure": true
                    }
                }
            }
        },
        "/iam/api/v1/user/auth/logout": {
            "CorrelationIdGenerator": {
                "active": false,
                "header": "x-correlation-id"
            },
            "Logging": {
                "active": false,
                "level": {
                    "request": {
                        "endpoint": 1,
                        "httpMethod": 1,
                        "header": 1,
                        "body": 1
                    },
                    "response": {
                        "endpoint": 1,
                        "httpMethod": 1,
                        "header": 1,
                        "body": 1,
                        "statusCode": 1,
                        "callDuration": 1,
                        "resBody": true
                    }
                }
            },
            "Logout": {
                "active": true
            }
        }
    },
    "preDefaultMiddlewares": {
        "CorrelationIdGenerator": {},
        "Logging": {}
    },
    "postDefaultMiddlewares": {},
    "updatedAt": "2021-06-21T07:02:50.600Z"
}

let headers : any = {
    "Content-Type" : "application/json",
    "x-auth-id" : "472802a6-0235-4f2b-882d-73e3edb813a2",
    "x-api-key" : "472802a6-0235-4f2b-882d-73e3edb813a2",
    "x-auth-token" : "4dFapAaejSUzCdlpMcMSx1ZMS04goQcsCRUJGE_GU4SxUXfW9DdxBanHycdCC3U9k5eJZdC8TtgCEEqStIuqFQ",
    "Cookie" : "authToken=4dFapAaejSUzCdlpMcMSx1ZMS04goQcsCRUJGE_GU4SxUXfW9DdxBanHycdCC3U9k5eJZdC8TtgCEEqStIuqFQ",
    "Authorization" : "Bearer 4dFapAaejSUzCdlpMcMSx1ZMS04goQcsCRUJGE_GU4SxUXfW9DdxBanHycdCC3U9k5eJZdC8TtgCEEqStIuqFQ"
}

const mobile : number = 9999467488;
const source : string = "insurance-dekho";
const sub_source : string = "b2c";
const name : string = "optional";
const otp : number = 999999;

export let testData : any = {
    configuration : configuration,
    headers : headers,
    mobile : mobile,
    source : source,
    sub_source : sub_source,
    name : name,
    otp : otp
} 