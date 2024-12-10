import { Service, Inject } from "typedi";
import { logger } from "@/utils/logger";
import CommunicationService from "@/services/communication-service";
import { IMailVariables } from "@/interfaces/download-helper-schema.interface";
import DownloadTemplateDecorator from "@/decorators/download-templates.decorator";

@Service()
export default class DownloadHelper {
  @Inject()
  private communicationService: CommunicationService;
  @Inject()
  private downloadTemplateDecorator: DownloadTemplateDecorator;

  public async sendEmail(mailVariables: IMailVariables, config: any) {
    try {
      const { email } = mailVariables;
      const subjectVariables =
        this.downloadTemplateDecorator[config.template.customVariableFn]?.(
          mailVariables
        );

      const emailList = email.split(",");
      const to = {};
      for (const emailId of emailList) {
        to[emailId] = "";
      }

      const body = {
        to: JSON.stringify(to),
        template_name: config.template.name,
        reference_type: config.template.REFERENCE_TYPE,
        reference_id: config.template.REFERENCE_ID,
        template_variable: JSON.stringify(subjectVariables),
      };
      return this.communicationService.sendEmail(body);
    } catch (error) {
      logger.error("Error in sendMail method in download helper", { error });
      return error;
    }
  }
}
