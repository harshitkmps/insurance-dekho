export interface Option {
  label: string;
  value: string;
}

export interface AdditionalFilter {
  label: string;
  key: string;
  options?: Option[];
  value: string[];
  type: string;
}

export interface KPI {
  label: string;
  key: string;
  aggregationType: string;
  isSelected: boolean;
}

export interface Product {
  label: string;
  value: string;
  additionalFilters?: AdditionalFilter[];
  isSelected: boolean;
  filtersSelected?: string[];
}

export interface EventVsProduct {
  label: string;
  value: string;
  products: Product[];
  kpis: KPI[];
  isSelected: boolean;
}
