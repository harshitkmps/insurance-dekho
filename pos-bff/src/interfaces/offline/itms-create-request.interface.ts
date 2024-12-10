export interface ItmsCreateRequestInterface {
  commonParameters: Common;
  customer: Customer;
  vehicle: Vehicle;
  ticket: Ticket;
  moreDetail: MoreDetails;
  insofflineQotes: PolicyDetails;
  offlineQuoteType: string;
  vahaanResponse: any;
  proposalDetails: any;
}

export interface PolicyDetails {
  source: string;
  subSource: string;
  medium: string;
  mode: string;
  requestType: string;
  //policy details
  caseType: number;
  policyType: number;
  within90Days: number;
  cngLpgKit: number;
  kitType: string | number;
  cngLpgValue: number;
  odTenure: string;
  caseReasonId: string;
  caseAdditionalReason: string;
  pos_id?: string;
  pos_state?: string;
  quoteRequestType: string;
  sourceCreatorId: string;
}

export interface Common {
  source: string;
  subSource: string;
  medium: string;
  mode: string;
  requestType: string;
}
export interface Ticket {
  id?: string;
  uuid?: string;
  ticketUuid?: string;
}
export interface Vehicle {
  //vehicle details
  vehicle_type: number;
  vehicleSubType: number;
  vehicleSubUsageType: string;
  permitUsageTypes: string;
  registration_no: string;
  rto: string;
  registration_date: string;
  manufacturing_date: string;
  fuel_type: string;
  make_id: string;
  model_id: string;
  variant_id: string;
  seating_capacity: string;
  makeModelName: string;
  grossWeight: string;
  gibpl_insurer_id: number | string;
  engineNo: string;
  chassisNo: string;
}
export interface Customer {
  business_unit_id: number;
  //dealer details
  dealer_id: string;
  ref_dealer_id: string;
}
export interface MoreDetails {
  preferred: any;
  addOns: number;
  claimTaken: string;
  previousNcb: number;
  previousNcbPercentage: number;
  prePolicyEnddate: string;
  prePolicyInsurerId: string;
  remarks: string;
}
