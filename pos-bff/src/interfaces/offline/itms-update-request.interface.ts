import { Customer, MoreDetails } from "./itms-create-request.interface";

interface Address {
  city: string;
}

interface Payment {
  payment_mode: string;
}

interface Proposal {
  ticketId: string;
  owner_type: number;
  full_name: string;
  mobile_no: string;
  email_address: string;
  dob: string;
  gender: string;
  marital_status: string;
  occupation: string;
  nominee_age: number;
  nominee_name: string;
  nominee_relation: string;
  appointee_name: string;
  appointee_relation: string;
  annual_income: string;
  pan_card: string;
  aadhar_card: string;
  address: string;
  address2: string;
  address3: string;
  city: number;
  state: number;
  pincode: number;
}

export interface ItmsUpdateRequestInteface {
  dont_update_status: boolean;
  selected_quotes_id: number;
  status_id: number;
  ticket_id: string;
  address: Address;
  customer: Customer;
  moreDetail: MoreDetails;
  payment: Payment;
  proposal: Proposal;
}
