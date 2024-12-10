/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {

    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                isolatedModules: true,
            },
        ],
    },
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    "moduleNameMapper": {
        "^@app/(.*)$": "<rootDir>/app/$1",
        "@tests/(.*)$": "<rootDir>/tests/$1",
        "@config/(.*)$": "<rootDir>/app/config/$1",
        "@models/(.*)$": "<rootDir>/app/models/$1",
        "@routers/(.*)$": "<rootDir>/app/routers/$1",
        "@services/(.*)$": "<rootDir>/app/services/$1",
        "@db/(.*)$": "<rootDir>/app/config/dbs/$1",
        "@interfaces/(.*)$": "<rootDir>/app/interfaces/$1",
        "@controllers/(.*)$": "<rootDir>/app/controllers/$1",
        "@helpers/(.*)$": "<rootDir>/app/utils/helpers/$1",
        "@constants/(.*)$": "<rootDir>/app/utils/constants/$1",
        "validations/(.*)$": "<rootDir>/app/factories/validationFactory/$1",
        "factories/(.*)$": "<rootDir>/app/factories/$1",
    }
};