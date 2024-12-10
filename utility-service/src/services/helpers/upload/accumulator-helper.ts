import { Service, Inject } from "typedi";
import { logger } from "@/utils/logger";
import CommunicationService from "@/services/communication-service";

@Service()
export default class AccumulatorConsumerHelper {
  @Inject()
  private communicationService: CommunicationService;
  public async sendMail(fileLink: string, email: string, config: any) {
    try {
      const mailConfig = config.mailConfig;
      const subjectVariables = {
        [mailConfig.variableMapping.fileLink]: fileLink,
      };
      const body = {
        to: this.createRecipients(email, mailConfig?.constants?.to),
        cc: this.createRecipients(null, mailConfig?.constants?.cc),
        bcc: this.createRecipients(null, mailConfig?.constants?.bcc),
        template_name: mailConfig.templateName,
        reference_type: mailConfig.referenceType,
        reference_id: mailConfig.referenceId,
        template_variable: JSON.stringify(subjectVariables),
      };
      const response = await this.communicationService.sendEmail(body);
      return response;
    } catch (error) {
      logger.error("Error in sendMail method while uploading", { error });
    }
  }

  public createRecipients(
    email: string,
    constantsRecipents: string[] | undefined
  ) {
    const emailRequest = {};
    const recipents = constantsRecipents ?? [];
    recipents.forEach((email) => {
      emailRequest[email] = "";
    });
    if (email) emailRequest[email] = "";
    return JSON.stringify(emailRequest);
  }
}
