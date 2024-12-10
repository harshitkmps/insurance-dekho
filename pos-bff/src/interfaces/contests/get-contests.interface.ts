export interface GetContestsQuery {
  source: string;
  contestId?: string;
  startDateTimeTill?: Date;
  startDateTimeFrom?: Date;
  endDateTimeTill?: Date;
  endDateTimeFrom?: Date;
  rewardDisbursmentDateTimeTill?: Date;
  rewardDisbursmentDateTimeFrom?: Date;
  eligibility?: any;
  participantIdentifier?: string;
  hierarchyEligibility?: any;
  hierarchyIdentifier?: string;
  projections?: string;
  nextCursor?: string;
  limit?: number;
  attributes?: any;
}
