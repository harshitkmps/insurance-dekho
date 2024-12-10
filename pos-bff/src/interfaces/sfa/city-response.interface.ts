export interface CityResponse {
  data: CityData[];
}

interface CityData {
  cityId: number;
  cityName: string;
  displayName: string;
  citySlug: string;
  isPopular: boolean;
  stateId: number;
}
