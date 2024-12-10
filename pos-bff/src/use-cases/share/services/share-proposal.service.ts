import { Injectable } from "@nestjs/common";
import { IncomingHttpHeaders } from "http2";
import { SENDER, TEMPLATES } from "../../../constants/communication.constants";
import CommunicationService from "../../../services/communication-service";
import MotorOnlineService from "@/src/services/motor-online-service";
import ItmsService from "@/src/core/api-helpers/itms-service";
import ContextHelper from "../../../services/helpers/context-helper";
import { LeadMiddlewareService } from "../../../core/api-helpers/lead-middleware.service";
import NonMotorLmwService from "@/src/services/non-motor-lmw.service";
import { HealthLeadMiddlewareService } from "@/src/services/health-lmw.service";

@Injectable()
export default class ShareProposalService {
  constructor(
    private communicationService: CommunicationService,
    private motorOnlineService: MotorOnlineService,
    private itmsService: ItmsService,
    private leadMiddlewareService: LeadMiddlewareService,
    private nonMotorLmwService: NonMotorLmwService,
    private healthLeadMiddlewareService: HealthLeadMiddlewareService
  ) {}

  public async shareProposal(
    body: any,
    headers: IncomingHttpHeaders
  ): Promise<any> {
    const product = body.product;
    const productWiseMapping = {
      motor: async () => {
        const { reqBody } = await this.prepareShareProposalReqPOS(
          body,
          headers.referer
        );
        const smsRes = await this.communicationService.sendSMS(reqBody);
        return { message: smsRes?.[0]?.message };
      },
      motorOffline: async () => {
        const { reqBody } = await this.prepareMotorOfflineShareReq(body);
        const smsRes = await this.communicationService.sendSMS(reqBody);
        return { message: smsRes?.[0]?.message };
      },
      health: async () => {
        const { reqBody } = this.prepareShareProposalReqNonMotor(
          body,
          headers.referer
        );
        const res = await this.healthLeadMiddlewareService.sharePaymentLink(
          reqBody,
          "health"
        );
        return { message: res };
      },
      investment: async () => {
        const { reqBody } = this.prepareShareProposalReqInvestment(
          body,
          headers.referer
        );
        const res = await this.leadMiddlewareService.sharePaymentLink(reqBody);
        return { message: res };
      },
      life: async () => {
        const { reqBody } = this.prepareShareProposalReqInvestment(
          body,
          headers.referer
        );
        const res = await this.leadMiddlewareService.sharePaymentLink(reqBody);
        return { message: res };
      },
      travel: async () => {
        const { reqBody } = this.prepareShareProposalReqNonMotor(
          body,
          headers.referer
        );
        const res = await this.nonMotorLmwService.sharePaymentLink(
          reqBody,
          "travel"
        );
        return { message: res };
      },
    };
    const shareProposalRes = await productWiseMapping[product]?.();
    return shareProposalRes;
  }

  public async prepareShareProposalReqPOS(
    body: any,
    pageLink: string
  ): Promise<any> {
    const reqSource = ContextHelper.getStore().get("medium");
    const leadResponse = await this.motorOnlineService.getDataFromLM(
      reqSource,
      body.leadId,
      "paymentSummary"
    );
    const shortenUrlResponse: any = await this.itmsService.shortenUrl(pageLink);
    const smsVariables = {
      NAME: leadResponse?.proposal?.customer_name ?? "",
      PREMIUM: leadResponse?.lead?.selected_quote?.finalPremium ?? "",
      INSURER: leadResponse?.lead?.selected_quote?.insurerShortName ?? "",
      LINK: shortenUrlResponse?.url ?? "",
    };
    const reqBody = {
      template_name: TEMPLATES.SMS_PAYMENT_LINK_TEMPLATE,
      sender: SENDER.SMS_PAYMENT_LINK,
      sms_variable: JSON.stringify(smsVariables),
      sent_to: JSON.stringify(leadResponse?.lead?.mobile_number?.split(",")),
      reference_type: "customer",
      reference_id: Date.now(),
    };
    return { reqBody };
  }

  public prepareShareProposalReqHealth(body: any): any {
    const reqBody = {
      request_id: body.leadId,
      type: body.type,
      product: body.product,
    };
    return { reqBody };
  }

  public prepareShareProposalReqInvestment(body: any, pageLink: string) {
    const reqBody = {
      leadId: body.leadId,
      product: body.product,
      mobile: body.mobile,
      mode: body.mode,
      shortUrl: body.shortUrl ?? "",
      pageLink: pageLink + (body.clientSideNavigationHash ?? ""),
      insurerName: body.insurerName,
    };
    return { reqBody };
  }

  public prepareShareProposalReqNonMotor(body: any, pageLink: string) {
    const reqBody = {
      leadId: body.leadId,
      product: body.product,
      mobile: body.mobile,
      mode: body.mode,
      shortUrl: body.shortUrl ?? "",
      pageLink: pageLink + (body.clientSideNavigationHash ?? ""),
      insurerName: body.insurerName,
      productType: body.product,
      medium: process.env.POS_MEDIUM,
    };
    return { reqBody };
  }

  public prepareMotorOfflineShareReq(body: any): any {
    const smsVariables = {
      NAME: body.name ?? "",
      PREMIUM: body.premium ?? "",
      INSURER: body.insurer ?? "",
      LINK: body.shortUrl ?? "",
    };
    const reqBody = {
      template_name: TEMPLATES.SMS_PAYMENT_LINK_TEMPLATE,
      sender: SENDER.SMS_PAYMENT_LINK,
      sms_variable: JSON.stringify(smsVariables),
      sent_to: JSON.stringify(body?.mobiles?.split(",")),
      reference_type: "customer",
      reference_id: Date.now(),
    };
    return { reqBody };
  }
}
