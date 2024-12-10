import { UserActivity } from "./user-activity.dto";

export class FraudResponseDto {
  message: string;
  status: number;
  data: any;
}

export interface BlackListUser {
  _id: string;
  blacklistAttribute: string;
  blacklistValue: string;
  uuid?: string;
  primaryAttributes?: PrimaryAttributes;
  secondaryAttributes?: SecondaryAttributes;
  lastUpdatedBy: string;
  status: string;
  updatedAt: string;
}

export interface PrimaryAttributes {
  name: string;
  mobileEncrypted: string;
  emailEncrypted: string;
  panEncrypted: string;
  mobileMasked: string;
  emailMasked: string;
  panMasked: string;
  address: string;
  gcdCode: string;
  dob: string;
  creationDate: string;
}

export interface SecondaryAttributes {
  fingerprints: string[];
  devices: string[];
}

export interface BlacklistUserMeta {
  hasNext: boolean;
  nextCursor: string | null;
}

export interface GetBlacklistUsersRes {
  users: BlackListUser[];
  meta: BlacklistUserMeta;
}

export interface ListingBlacklistedUser {
  id: string;
  uuid?: string;
  name?: string;
  gcdCode?: string;
  panMasked?: string;
  emailMasked?: string;
  mobileMasked?: string;
  status?: string;
  updatedAt: string;
}

export interface GetFraudUsersRes {
  users: ListingBlacklistedUser[];
  meta: BlacklistUserMeta;
}

export interface GetBlacklistedUserByIdRes {
  blacklistedUser: Partial<BlackListUser>;
  userActivity: Partial<UserActivity>[];
}

export interface BlacklistUserProfile {
  name: string;
  gcdCode: string;
  emailMasked: string;
  mobileMasked: string;
  panMasked: string;
  dob: string;
  address: string;
  creationDate: string;
  status: string;
  blacklistAttributeKey: string;
  blacklistAttributeValue: string;
  cta: string;
}

export interface TransformedUserActivity {
  category: string;
  info: UserActivityInfo[];
}

export interface UserActivityInfo {
  heading: string;
  tag: string;
  date: string;
  time: string;
  tagColor: string;
}

export interface UniqueDeviceMap {
  [type: string]: DeviceDetails;
}

export interface DeviceDetails {
  name: string;
  lastLogin: string;
  activityDate: string;
  currentStatus: string;
  deviceType: string;
}

export interface BlacklistUserProfileRes {
  blacklistedUser: BlacklistUserProfile;
  userActivity: TransformedUserActivity[];
  devices: DeviceDetails[];
}
