import loggerService from "@services/LoggerService";
import apiHelper from "@app/utils/helpers/ApiHelper";
import tpApiLogService from "@services/TpApiLogService";

export default {
    // httpRequestMocker       :   jest.spyOn(apiHelper,'httpRequest'),
    errorLogMocker          :   jest.spyOn(loggerService,'generateErrorLog'),
    apiLogMocker            :   jest.spyOn(loggerService,'generateApiLog'),
    tpApiLogMocker          :   jest.spyOn(tpApiLogService,'generateTpApiLog'),
    unhandledErrorLogMocker :   jest.spyOn(loggerService,'generateUnhandledErrorLog'),
}