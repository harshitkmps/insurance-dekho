export interface ClubDetailsInteface {
  name: string;
  points: number;
  pointsLabel: string;
  benefits: benefit[];
  rewards: rewards[];
  index: number;
}

interface benefit {
  title: string;
  slug: string;
  isAvailable: boolean;
  index: 0;
}

enum rewardType {
  TRIP_REWARD = "TRIP_REWARD",
  KIT_REWARD = "KIT_REWARD",
}

interface rewards {
  type: rewardType;
  subType: string;
  name: string;
  image?: string;
  description?: string;
}
