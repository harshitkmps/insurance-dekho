export interface GetPolicyBookRatio {
  uuid: string;
}

export interface PolicyBookRatioRes {
  motorOnline: PolicyLeadCount;
  motorOffline: PolicyLeadCount;
}

export interface PolicyLeadCount {
  policies: number;
  leads: number;
}
