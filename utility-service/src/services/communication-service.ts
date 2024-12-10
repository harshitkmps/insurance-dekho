import { logger } from "@/utils/logger";
import { Inject, Service } from "typedi";
import CommonApiHelper from "./helpers/common-api-helper";
import { ComparatorMailVariables } from "@/interfaces/comparator-accumulator.interface";
import { INVALID_EMAIL_TEMPLATE } from "@/constants/upload.constants";

@Service()
export default class CommunicationService {
  @Inject()
  private apiHelper: CommonApiHelper;

  public async sendEmail(body: any) {
    try {
      const options = {
        endpoint: `${process.env.COMMUNICATION_ENDPOINT}/send_mail`,
      };
      const res = await this.apiHelper.postData(options, body);
      logger.info("sent mail response", { body, res });
      return res;
    } catch (err) {
      logger.error("error in send mail API", { err });
      return err;
    }
  }

  public prepareComparatorMailVariables(
    data: ComparatorMailVariables,
    mailConfig: any
  ) {
    const subjectVariables = {
      MATCHED: data.MATCHED,
      MISMATCHED: data.MISMATCHED,
      UNMATCHED: data.UNMATCHED,
      VALIDATION_FAILED: data.VALIDATION_FAILED,
      LINK: data.link,
      NAME: data.name,
    };
    const body = {
      to: this.createRecipients(data.email),
      cc: this.createRecipients("", mailConfig?.constants?.cc),
      bcc: this.createRecipients("", mailConfig?.constants?.bcc),
      template_name: mailConfig.name,
      reference_type: mailConfig.referenceType,
      reference_id: mailConfig.referenceId,
      template_variable: JSON.stringify(subjectVariables),
    };

    return body;
  }

  public createRecipients(email = "", constantsRecipents: string[] = []) {
    const emailRequest = {};
    const recipents = constantsRecipents ?? [];
    const emailArr = recipents.concat(email?.split(","));
    for (const emailId of emailArr) {
      emailRequest[emailId] = "";
    }
    return JSON.stringify(emailRequest);
  }

  public async sendRequestFailedEmail(
    message: string,
    email: string,
    type: string
  ) {
    const templateVariables = {
      message,
      type,
    };
    const body = {
      to: JSON.stringify({ [email]: "" }),
      template_name: INVALID_EMAIL_TEMPLATE,
      reference_type: INVALID_EMAIL_TEMPLATE,
      reference_id: INVALID_EMAIL_TEMPLATE,
      template_variable: JSON.stringify(templateVariables),
      subject_variable: JSON.stringify(templateVariables),
    };
    const response = await this.sendEmail(body);
    return response;
  }
}
