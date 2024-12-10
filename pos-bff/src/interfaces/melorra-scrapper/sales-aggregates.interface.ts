export interface SalesAggregatesFilters {
  sales_iam_uuid: string;
  start_date: string;
  end_date: string;
  team_uuid?: string;
  level_id?: number;
}

export interface SalesProductAggregatesFilters extends SalesAggregatesFilters {
  lob: string;
}

export interface SalesSubCategoryAggregateFilters
  extends SalesAggregatesFilters {
  vehicle_type?: string;
  policy_type?: string;
}

export interface SalesSubCategoryAggregatesBody {
  filters: SalesSubCategoryAggregateFilters;
  projections: string[];
}

export interface SalesAggregatesBody {
  filters: SalesProductAggregatesFilters;
  projections: string[];
}
