class Constants {

    // ENV CONFIGURATIONS
    public readonly baseURL: any = process.env.API_GATEWAY_BASEURL;
    public readonly mongoDBConfig: any = (() => {
        let API_GATEWAY_MONGODB_CONFIG: any = process.env.API_GATEWAY_MONGODB_CONFIG;
        try {
            API_GATEWAY_MONGODB_CONFIG = JSON.parse(API_GATEWAY_MONGODB_CONFIG);
        } catch (err) {
            API_GATEWAY_MONGODB_CONFIG = {};
        }
        return API_GATEWAY_MONGODB_CONFIG;
    })();

    public readonly redisConfig: any = (() => {
        let API_GATEWAY_REDIS_CONFIG: any = process.env.API_GATEWAY_REDIS_CONFIG;
        try {
            API_GATEWAY_REDIS_CONFIG = JSON.parse(API_GATEWAY_REDIS_CONFIG);
        } catch (err) {
            API_GATEWAY_REDIS_CONFIG = {};
        }
        return API_GATEWAY_REDIS_CONFIG;
    })();

    public readonly RECAPTCHA_SECRET: any = process.env.API_GATEWAY_RECAPTCHA_SECRET;
    public readonly NEW_RELIC_LICENSE_KEY: any = process.env.API_GATEWAY_NEW_RELIC_LICENSE_KEY;

    public readonly urlGroupIndex: number = 1;
    public readonly TIMEZONE: string = "Asia/Calcutta";
    public readonly REDIS_RELATION_MAPPING_KEY: string = "_RMRK001";
    public readonly REDIS_EDUCATION_MAPPING_KEY: string = "_EDMRK001";
    public readonly REDIS_OCCUPATION_MAPPING_KEY: string = "_OMRK002";
    public readonly DB_CHUNK_COUNT: number = 20;

    public readonly ERROR_CATEGORY: any = {
        GIBPL: "GIBPL-error",
    };

    public readonly TEST = "TestTBL";

    public readonly ttlCategoty: any = {
        sameDay: 0, // same day // isValidaForSameDay
        oneDay: 60 * 60 * 24, // 1 day
        threeDays: 60 * 60 * 24 * 3, // 3 days
        oneWeek: 60 * 60 * 24 * 7, // 1 week
        twoWeek: 60 * 60 * 24 * 14, // 2 week
        fourWeek: 60 * 60 * 24 * 28, // 4 week
    };

    public readonly isRedisEnabled = 1;
    public readonly gatewayRedisKey: any = process.env.API_GATEWAY_REDIS_CONFIGURATION_KEY;
    public readonly gatewayBackupRedisKey: any = process.env.API_GATEWAY_REDIS_BACKUP_CONFIGURATION_KEY;
    public readonly jwtCacheKey: any = process.env.API_GATEWAY_REDIS_JWT_CACHE_KEY;
    public readonly hostNameKey: string = "X-HOSTNAME";

    public readonly apiResponseVersion: any = {
        v1 : "v1",
        v2 : "v2",
    };

    public readonly oneTimeTokenExpiry: number = 5; // time in minutes

    public readonly oneTimeTokenResponseHeader: string = "One-Time-Token";

    public readonly sessionIdHeader: string = "Session-Id";

    public readonly refAuthId: string = "refAuthId";

    public readonly WHITELISTED_ORIGINS =  ["insurancedekho.com", "girnarinsurance.com", "pnlmanager.com", "gridpoint.live", "idedge.in"];

    public readonly RABBITMQ = {
        HOST : process.env.RABBITMQ_HOST,
        PORT : process.env.RABBITMQ_PORT,
        USER_NAME : process.env.RABBITMQ_USERNAME,
        PASSWORD : process.env.RABBITMQ_PASSWORD,
        RECONNECT_TIME_IN_SECONDS : process.env.RECONNECT_TIME_IN_SECONDS || 10,
        QUEUE : {
            ACTIVITY_TRACKER_QUEUE : process.env.RABBITMQ_ACTIVITY_TRACKING_QUEUE,
        },
    };

    constructor() {
    }
}

export const C = new Constants();
