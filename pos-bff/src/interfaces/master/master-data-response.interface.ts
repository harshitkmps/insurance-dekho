export interface MasterInsurerDataResponse {
  insurers: InsurerData[];
}

export interface InsurerData {
  insurerId: Number;
  insurerName: string;
  shortName: string;
  slug: string;
  insurerLogo: string;
  insurerImage: string;
}

export interface MasterPetDataResponse {
  breeds: PetData[];
}

interface PetData {
  id: number;
  name: string;
  category: string;
  slug: string;
  breedLogo: string;
}
