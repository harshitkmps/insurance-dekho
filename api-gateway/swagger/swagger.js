exports.swagger = {
    openapi: "3.0.3",
    info: {
        version: "1.0.1",
        title: "APIs Document",
        description: " api gateway project",
        termsOfService: "",
        contact: {
            name: "ayush",
            email: "ayush.chaudhary@insurancedekho.com",
            url: "https://insurancedekho.com/",
        },
        license: {
            name: "Apache 2.0",
            url: "https://www.apache.org/licenses/LICENSE-2.0.html",
        },
    },
    servers: [
        {
            url: "http://localhost:7200/api/v1",
            description: "Local ENV",
        },
    ],
    basePath: "/",
    tags: [
        {
            name: "Api Gateway",
            description: "api's for fetching and updating Configuration",
        },
    ],
    paths: {
        "/configuration": {
            summary: "set global summary",
            description: "set global desc",
            servers: "",
            get: {
                tags: [
                    "Api Gateway",
                ],
                operationId: "getConfiguration",
                summary: "fetches the Configuration ",
                description: "fetches Configuration for gateway",
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                schema: {
                                    items: {
                                        $ref: "#/components/schemas/getResponse",
                                    },
                                },
                            },
                        },
                    },
                    400: {
                        description: " not valid",
                    },
                    404: {
                        description: " not found",
                    },
                    default: {
                        description: "Unexpected error",
                    },
                },
            },
        },
        "/configuration/": {
            summary: "set global summary",
            description: "set global desc",
            servers: "",
            parameters: "",
            post: {
                tags: [
                    "Api Gateway",
                ],
                operationId: "setConfiguration",
                summary: "sets the Configuration",
                description: "sets Configuration for gateway",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/PostBody",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                schema: {
                                    items: {
                                        $ref: "#/components/schemas/PostRes",
                                    },
                                },
                            },
                        },
                    },
                    400: {
                        description: "Not valid.",
                    },
                    404: {
                        description: "Not found.",
                    },
                    default: {
                        description: "Unexpected error",
                    },
                },
            },
        },
        "schemes": [
            "http",
        ],
        "consumes": [
            "application/json",
        ],
        "produces": [
            "application/json",
        ],
    },
    components: {
        schemas: {
            getResponse: {
                type: "object",
                properties: {
                    middlewares: {
                        type: "object",
                        description: "list of middlewares",
                        example: {
                            "Authentication": {
                                "active": true,
                                "authType": {
                                    "strict": ["/*"],
                                    "both": [],
                                    "skip": [],
                                },
                                "token": ["cookie", "header"],
                            },
                            "Whitelisting": {
                                "active": true,
                            },
                            "Logging": {
                                "active": true,
                                "level": { "request": { "endpoint": 1, "httpMethod": 1, "header": 1, "body": 1 }, "response": { "endpoint": 1, "httpMethod": 1, "header": 1, "body": 1, "statusCode": 1, "callDuration": 1 } },
                            },
                            "CorrelationIdGenerator": {
                                "header": "x-correlation-id",
                                "minLength": 8,
                                "maxLength": 20,
                            },
                        },
                    },
                    absoluteRoutes: {
                        type: "object",
                        description: "absolute route of otp login",
                        example: {
                            "/iam/api/v1/user/auth/login/otp": { "allowedDomains": [], "outgoing": "http://localhost:8080/api/v1/user/auth/login/otp" },
                            "/iam/api/v1/user/auth/login/otp/verify": { "allowedDomains": [], "outgoing": "http://localhost:8080/api/v1/user/auth/login/otp/verify" },
                        },
                    },
                    urlGroups: {
                        type: "object",
                        description: "url grouping",
                        example: {"allowedDomains": [], "outgoing": "http://localhost:8080"},
                    },
                    preDefaultMiddlewares: {
                        type: "object",
                        description: "pre default middlewares",
                        example: {
                            "correlationIdGenerator" : {},
                            "Logging" : {},
                        },
                    },
                    postDefaultMiddlewares : {
                        type : "object",
                        description : "post default middlewares",
                        example : {},
                    },
                    groupMiddlewareMapping: {
                        type: "object",
                        description: "middleware mapping corresponding to a group/absoluteRoute",
                        example: {
                            "iam": {
                                "Whitelisting": {},
                                "Authentication": {
                                    "active": true,
                                    "authType": {
                                        "strict": [],
                                        "both": [],
                                        "skip": [],
                                    },
                                },
                            },
                            "/iam/api/v1/user/auth/login/otp": {
                                "Whitelisting": {},
                                "Authentication": {
                                    "active": true,
                                    "authType": {
                                        "strict": [],
                                        "both": [],
                                        "skip": ["/api/v1/user/auth/login/otp"],
                                    },
                                },
                            },
                            "/iam/api/v1/user/auth/login/otp/verify": {
                                "Whitelisting": {},
                                "Authentication": {
                                    "active": true,
                                    "authType": {
                                        "strict": [],
                                        "both": ["/api/v1/user/auth/login/otp/verify"],
                                        "skip": [],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            PostBody: {
                type: "object",
                properties: {
                    middlewares: {
                        type: "object",
                        description: "list of middlewares",
                        example: {
                            "Authentication": {
                                "active": true,
                                "authType": {
                                    "strict": ["/*"],
                                    "both": [],
                                    "skip": [],
                                },
                                "token": ["cookie", "header"],
                            },
                            "Whitelisting": {
                                "active": true,
                            },
                            "Logging": {
                                "active": true,
                                "level": { "request": { "endpoint": 1, "httpMethod": 1, "header": 1, "body": 1 }, "response": { "endpoint": 1, "httpMethod": 1, "header": 1, "body": 1, "statusCode": 1, "callDuration": 1 } },
                            },
                            "CorrelationIdGenerator": {
                                "header": "x-correlation-id",
                                "minLength": 8,
                                "maxLength": 20,
                            },
                        },
                    },
                    absoluteRoutes: {
                        type: "object",
                        description: "absolute route of otp login",
                        example: {
                            "/iam/api/v1/user/auth/login/otp": { "allowedDomains": [], "outgoing": "http://localhost:8080/api/v1/user/auth/login/otp" },
                            "/iam/api/v1/user/auth/login/otp/verify": { "allowedDomains": [], "outgoing": "http://localhost:8080/api/v1/user/auth/login/otp/verify" },
                        },
                    },
                    urlGroups: {
                        type: "object",
                        description: "url grouping",
                        example: { "allowedDomains": [], "outgoing": "http://localhost:8080" },
                    },
                    preDefaultMiddlewares: {
                        type: "object",
                        description: "pre default middlewares",
                        example: {
                            "correlationIdGenerator": {},
                            "Logging": {},
                        },
                    },
                    postDefaultMiddlewares: {
                        type: "object",
                        description: "post default middlewares",
                        example: {},
                    },
                    groupMiddlewareMapping: {
                        type: "object",
                        description: "middleware mapping corresponding to a group/absoluteRoute",
                        example: {
                            "iam": {
                                "Whitelisting": {},
                                "Authentication": {
                                    "active": true,
                                    "authType": {
                                        "strict": [],
                                        "both": [],
                                        "skip": [],
                                    },
                                },
                            },
                            "/iam/api/v1/user/auth/login/otp": {
                                "Whitelisting": {},
                                "Authentication": {
                                    "active": true,
                                    "authType": {
                                        "strict": [],
                                        "both": [],
                                        "skip": ["/api/v1/user/auth/login/otp"],
                                    },
                                },
                            },
                            "/iam/api/v1/user/auth/login/otp/verify": {
                                "Whitelisting": {},
                                "Authentication": {
                                    "active": true,
                                    "authType": {
                                        "strict": [],
                                        "both": ["/api/v1/user/auth/login/otp/verify"],
                                        "skip": [],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            PostRes: {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        example: "Configuration has been updated successfully",
                    },
                },
            },
        },
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
};
