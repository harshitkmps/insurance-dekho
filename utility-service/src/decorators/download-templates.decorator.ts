import { Service } from "typedi";

@Service()
export default class DownloadTemplateDecorator {
  public generateCasesDownloadVariables(userDefinedVariables: any): any {
    return {
      USER_NAME: userDefinedVariables.name,
      URL: userDefinedVariables.signedUrl,
    };
  }

  public generateAdminDisputeListingDownloadVariables(
    userDefinedVariables: any
  ): any {
    return {
      START_DATE: userDefinedVariables.query.startDate,
      END_DATE: userDefinedVariables.query.endDate,
      DOWNLOAD_LINK: userDefinedVariables.signedUrl,
      TXN_TYPE: userDefinedVariables.query.txnType,
      DOMAIN_ID: userDefinedVariables.query.domainId,
    };
  }
}
