import { PartnerCohortFilters } from "./partner-base-dealer-count.interface";

export interface PartnerBaseDealerSearchFilter {
  dealer_iam_uuid: string;
  start_date: string;
  end_date: string;
  is_pmtd_data: boolean;
}

export interface PartnerBaseDealersBody {
  filters: PartnerCohortFilters | PartnerBaseDealerSearchFilter;
  projections: string[];
  limit: number;
  offset: number;
  isRenewalDashboard?: boolean;
}

export interface PartnerCohortProjectionConfig {
  allowLobWise: boolean;
  projections?: string[];
}
