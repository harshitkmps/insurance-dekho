export interface SalesTargetsFilters {
  date: string;
  iam_uuid: string;
  team_uuid: string;
  time_duration: string;
}

export interface SalesTargetsBody {
  filters: SalesTargetsFilters;
  projections: string[];
}
