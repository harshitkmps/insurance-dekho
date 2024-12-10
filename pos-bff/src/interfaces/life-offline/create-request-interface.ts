export interface LifeOfflineCreateRequestInterface {
  ticketDetails: TicketDetails;
  insuredDetails: InsuredDetails[];
  proposerDetails: ProposerDetails;
  medicalDetails: MedicalDetails;
  customerDetails: CustomerDetails;
  premiumDetails: PremiumDetails;
  planDetails: PlanDetail[];
  docDetails: DocDetails[];
}

export interface TicketDetails {
  quotes: any[];
  dealerId: number;
  dealerCityId: number;
  status: number;
  subStatus: number;
  policyType: number;
  ticketUuid: string;
  insurerId: number;
  insurerName: string;
  videoStatus: number;
  source: string;
  subSource: string;
  proposalNumber: string;
  productType: string;
}

export interface InsuredDetails {
  name: string;
  dob: string;
  gender: string;
  pan: string;
  mobile: string;
  altMobile: string;
  email: string;
  education: string;
  occupation: string;
  relationship: string;
  annualIncome: number;
  maritalStatus: string;
  residentialStatus: string;
  country: string;
  heightFt: string;
  heightIn: string;
  address: string;
  pincode: string;
  area: string;
  state: string;
  stateId: number;
  city: string;
  cityId: number;
  preExistingPolicy: string;
  preexistingSumAssured: string;
  weight: string;
}

export interface ProposerDetails {
  relationship: string;
  name: string;
  dob: string;
  mobile: string;
  altMobile: string;
  email: string;
  education: string;
  occupation: string;
  annualIncome: number;
  gender: string;
  address: string;
  pincode: string;
  country: string;
  area: string;
  state: string;
  stateId: number;
  city: string;
  cityId: number;
  isSmoke: boolean;
  ecsOpted: boolean;
  maritalStatus: string;
  residentialStatus: string;
  pan: string;
}

export interface MedicalDetails {
  isSmoker: boolean;
  diseaseStatus: boolean;
  diseaseComment: string;
  covidStatus: boolean;
  covidComment: string;
  dateOfRecovery: string;
}

export interface CustomerDetails {
  customerName: string;
  gender: string;
  mobile: number;
  altMobile: number;
  dob: string;
  panNumber: string;
  email: string;
  address: string;
  nationality: string;
  annualIncome: number;
  annualIncomeDisplayName: string;
  occupation: string;
  comments: string;
  qualification: string;
  height: string;
  weight: number;
  preExistingPolicy: boolean;
  preExistingSumAssured: number;
  state: string;
  city: string;
  cityId: number;
  stateId: number;
  pinCode: number;
}

export interface PremiumDetails {
  premium: number;
  paymentFrequency: string;
  paymentTerm: number;
  paymentMode: string;
  gstWaiver: boolean;
}

export interface PlanDetail {
  planName: string;
  planId: number;
  planSlug: string;
  subPlan: number;
  productTypeSlug: string;
  subPlanType: string;
  productType: string;
  coverage: number;
  policyTerm: number;
  sumAssured: number;
  insurerId: number;
  insurerName: string;
  insurerSlug: string;
  planType: string;
  premiumPaymentOption: string;
  premiumPaymentOptionSlug: string;
}

export interface DocDetails {
  docLabel: string;
  docName: string;
  docId: string;
}

export interface ConfigResponse {
  data?: any;
}
