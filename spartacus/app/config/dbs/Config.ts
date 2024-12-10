/**
 * Author - Ankit Shukla
 */

 export default class Config {
    public static readonly MYSQL = {
        MASTER : {
            host            :   process.env.MYSQL_CONFIG_MASTER_HOST,
            user            :   process.env.MYSQL_CONFIG_MASTER_USERNAME,
            password        :   process.env.MYSQL_CONFIG_MASTER_PASSWORD,
            database        :   process.env.MYSQL_CONFIG_MASTER_DB_NAME,
            connectionLimit :   process.env.MYSQL_CONFIG_MASTER_MAX_CONNECTIONS
        },
        SLAVE : {
            host            :   process.env.MYSQL_CONFIG_SLAVE_HOST,
            user            :   process.env.MYSQL_CONFIG_SLAVE_USERNAME,
            password        :   process.env.MYSQL_CONFIG_SLAVE_PASSWORD,
            database        :   process.env.MYSQL_CONFIG_SLAVE_DB_NAME,
            connectionLimit :   process.env.MYSQL_CONFIG_SLAVE_MAX_CONNECTIONS
        },
    };

    public static readonly MONGO = {
        MAIN : {
            DRIVER          :   process.env.MONGO_CONFIG_MAIN_DRIVER,
            HOST            :   process.env.MONGO_CONFIG_MAIN_HOST,
            PORT            :   process.env.MONGO_CONFIG_MAIN_PORT,
            USER            :   process.env.MONGO_CONFIG_MAIN_USERNAME,
            PASSWORD        :   process.env.MONGO_CONFIG_MAIN_PASSWORD,
            DB              :   process.env.MONGO_CONFIG_MAIN_DB_NAME,
            AUTH_SOURCE     :   process.env.MONGO_CONFIG_MAIN_AUTH_SOURCE
        },
        LOGGER : {
            DRIVER          :   process.env.MONGO_CONFIG_LOGGER_DRIVER,
            PORT            :   process.env.MONGO_CONFIG_LOGGER_PORT,
            HOST            :   process.env.MONGO_CONFIG_LOGGER_HOST,
            USER            :   process.env.MONGO_CONFIG_LOGGER_USERNAME,
            PASSWORD        :   process.env.MONGO_CONFIG_LOGGER_PASSWORD,
            DB              :   process.env.MONGO_CONFIG_LOGGER_DB_NAME,
            AUTH_SOURCE     :   process.env.MONGO_CONFIG_LOGGER_AUTH_SOURCE
        },
    };
}