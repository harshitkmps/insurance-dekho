export interface ContestResponse {
  contestId: string;
  name: string;
  startDateTime: Date;
  endDateTime: Date;
  milestones: any[];
  timeFrames: any[];
  userPerfomance: any;
  userPerfomanceWithRank: any;
  totalParticipants: number;
  contestPerfomance: any;
  weightages: any[];
  additionalData: Record<string, any>;
}
