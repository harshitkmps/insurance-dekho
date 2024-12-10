interface ChannelPartner {
  data: Dealer[];
  total_row_count: number;
  current_page_last_row_number: number;
}

interface ChannelPartnerResponse {
  meta: any;
  data: ChannelPartner;
}

interface Dealer {
  dealerId: string;
  source: string;
  central_city_name: string;
  central_city_id: string;
  dealer_organization: string;
  dealer_refer_id: string;
  channel_partner_sub_type: string;
  status: number;
}

export { Dealer, ChannelPartner, ChannelPartnerResponse };
