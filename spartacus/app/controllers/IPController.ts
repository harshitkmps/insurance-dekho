import logger from '@app/config/services/WinstonConfig';
import ERROR_Constants from '@constants/ErrorConstants';
import thirdPartyConfig from '@config/services/ThirdPartyConfig';
import apiHelper from "@helpers/ApiHelper";
import requestBuilder from '@helpers/RequestBuilder';
import { RequestTypes } from "@app/enums/RequestType";
import { RequestDestination } from "@app/enums/RequestDestination";
export default class IPController {
  static IPInfo = async (req: any, res: any) => {
    try {
      if (!req.body.ip || !JSON.parse(req.body.ip).clientIP) {
        return res.error(
          400,
          'BAD_REQUEST',
          RequestDestination.IP_INFO_MAPPING,
          {
            ...ERROR_Constants.PC_GCPM_002,
            ...{ [ERROR_Constants.ERROR_DESC]: 'IP is required in the request body' },
          }
        );
      }
      const clientIP = JSON.parse(req.body.ip).clientIP;
      thirdPartyConfig.IP_INFO_SERVICE.END_POINTS.IP_INFO = `${clientIP}/json`;
 

      const request = requestBuilder.build(RequestTypes.IP_INFO, '');
      const result = await apiHelper.httpRequest(request);

      return res.return(
        200,
        "SUCCESS",
        RequestDestination.IP_INFO_MAPPING,
        result
      );
    } catch (err) {
      logger.error(`Error in fetching IP info: ${err}`);
      return res.error(500, 'SERVER_ERROR', RequestDestination.IP_INFO_MAPPING, { ...ERROR_Constants.PC_GCPM_001, ...{ [ERROR_Constants.ERROR_DESC]: err } });
    }
  };
}
