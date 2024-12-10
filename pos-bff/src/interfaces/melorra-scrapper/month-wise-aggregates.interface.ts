export interface MonthlyAggregatesFilters {
  sales_iam_uuid: string;
  team_uuid: string;
  level_id: number;
  start_year_month: number;
  end_year_month: number;
}

export interface ProductMonthlyAggregatesFilters
  extends MonthlyAggregatesFilters {
  lob: string;
}

export interface MonthlySubCategoryAggregateFilters
  extends MonthlyAggregatesFilters {
  vehicle_type?: string;
  policy_type?: string;
}

export interface MonthwiseAggregatesBody {
  filters: MonthlyAggregatesFilters;
  projections: string[];
}

export interface ProductBreakupMonthwiseAggregatesBody {
  filters: MonthlySubCategoryAggregateFilters;
  projections: string[];
}
