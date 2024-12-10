interface EmailRequest {
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  templateName: string;
  variables?: any;
  attachmentUrl?: string;
}
interface SmsRequest {
  mobile: string;
  templateName: string;
  variables: any;
}

export { EmailRequest, SmsRequest };
