import { IResult } from "ua-parser-js";

export interface UserActivity {
  _id: string;
  iamUUID?: string;
  requestSource: string;
  referrer: string;
  timeOfActivity: string;
  ipv4?: string;
  ipv6?: string;
  endpoint: string;
  query?: any;
  body?: any;
  leadId?: string;
  sessionId?: string;
  canvasFingerprint?: string;
  appVersion?: string;
  deviceId?: string;
  deviceModel?: string;
  deviceName?: string;
  devicePlatform?: string;
  osVersion?: string;
  latitude?: string;
  longitude?: string;
  eventName?: string;
  userAgentDetails: IResult;
  createdAt: string;
}
