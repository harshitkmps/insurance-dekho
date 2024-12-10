export interface ParsedEmail {
  attachments?: any[];
  date: Date;
  from: any;
  headerLines?: any[];
  headers?: any;
  html?: string;
  messageId?: string;
  subject?: string;
  text?: string;
  textAsHtml?: string;
  to: any;
}
