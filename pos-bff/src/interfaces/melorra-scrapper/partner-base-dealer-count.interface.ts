import { SalesAggregatesFilters } from "./sales-aggregates.interface";

export interface DealerCountFilters {
  sales_iam_uuid: string;
  team_uuid: string;
  level_id: number;
}

export interface ActiveDealerFilters extends DealerCountFilters {
  start_date: string;
  end_date: string;
  is_active?: boolean;
  is_active_lob?: string;
  is_pmtd_data?: boolean;
}

export interface OnboardedButNotActiveFilters extends DealerCountFilters {
  start_date: string;
  end_date: string;
  one_year_inactive?: boolean;
  all_time_inactive?: boolean;
  inactive_lob: string;
}

export interface LessThanNMonthsActiveFilters extends DealerCountFilters {
  current_date: string;
  drop_off_lob: string;
  active_duration_in_any_month: number;
  is_pmtd_data?: boolean;
}

export interface NMonthsActiveFilters extends DealerCountFilters {
  current_date: string;
  drop_off_lob: string;
  drop_off_duration?: number;
  active_duration_in_months?: number[];
  is_pmtd_data?: boolean;
}

export interface IrregularActiveFilters extends DealerCountFilters {
  current_date: string;
  drop_off_lob: string;
  is_irregular: boolean;
}

export interface PartnerCohortFilters
  extends Partial<OnboardedButNotActiveFilters>,
    Partial<LessThanNMonthsActiveFilters>,
    Partial<NMonthsActiveFilters>,
    Partial<ActiveDealerFilters>,
    Partial<IrregularActiveFilters> {}

export interface PartnerCohortWisePayload {
  cohortName: string;
  filters: PartnerCohortFilters;
}

export interface ActiveDealerCohortPayload {
  cohortName: string;
  filters: SalesAggregatesFilters;
}

export interface PartnerCohortCountBody {
  filters: PartnerCohortFilters;
  projections: string[];
}
