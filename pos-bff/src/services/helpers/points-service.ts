import CommonApiHelper from "./common-api-helper";
import DateTimeUtils from "../../utils/date-time-utils";
import { Injectable, Logger } from "@nestjs/common";
import { ClubDetailsInteface } from "@/src/interfaces/points/points.interface";
import CommonUtils from "@/src/utils/common-utils";
import { PosRoles } from "@/src/constants/pos-roles.constants";
import ConfigService from "../config-service";
import {
  ACHIEVERS_CLUB_CLUBS_DETAIL,
  KIT_REWARD,
  POINTS_LIST_PROJECTION,
  TOP_N_REWARDS_AND_BENEFITS,
} from "@/src/constants/points.constants";

@Injectable()
export default class PointsService {
  constructor(
    public readonly commonApiHelper: CommonApiHelper,
    private readonly configService: ConfigService
  ) {}

  private getCurrentClub = (totalPoints: number, sortedClubs: any[]) =>
    sortedClubs.reduce(
      (acc, club) => (totalPoints >= club.points ? club : acc),
      sortedClubs[0]
    );

  private getNextClub = (currentClubIndex: number, sortedClubs: any[]) =>
    sortedClubs[currentClubIndex + 1] || null;

  private getPointsLeftForNextClub = (
    totalPoints: number,
    nextClub: ClubDetailsInteface | null
  ) => (nextClub ? nextClub.points - totalPoints : "None");

  private findNearestClubWithTrip = (
    currentClubIndex: number,
    sortedClubs: any[]
  ) => {
    const nearestClub = sortedClubs
      .slice(currentClubIndex + 1)
      .find((club) =>
        club.rewards.some((reward) => reward.type === "TRIP_REWARD")
      );

    if (nearestClub) {
      const tripReward = nearestClub.rewards.find(
        (reward) => reward.type === "TRIP_REWARD"
      );

      return {
        clubName: nearestClub.name,
        tripTitle: tripReward.name,
        description: tripReward.description,
        image: tripReward.image,
      };
    }

    return null;
  };

  private gettopNRewardsAndBenefits(
    nextClubRewards,
    nextClubBenefits,
    benefits
  ) {
    const topNRewardsAndBenefits = [];

    const pushIfAvailable = (item) => {
      if (
        item.isAvailable &&
        topNRewardsAndBenefits.length < TOP_N_REWARDS_AND_BENEFITS
      ) {
        topNRewardsAndBenefits.push({ title: item.title });
      }
    };

    nextClubRewards?.forEach((reward) => {
      if (
        reward.type === KIT_REWARD &&
        topNRewardsAndBenefits.length < TOP_N_REWARDS_AND_BENEFITS
      ) {
        topNRewardsAndBenefits.push({ title: reward.name });
      }
    });

    if (topNRewardsAndBenefits.length === TOP_N_REWARDS_AND_BENEFITS)
      return topNRewardsAndBenefits;

    for (let idx = nextClubBenefits?.length - 1 ?? -1; idx >= 0; idx--) {
      pushIfAvailable(nextClubBenefits[idx]);
      if (topNRewardsAndBenefits.length === TOP_N_REWARDS_AND_BENEFITS)
        return topNRewardsAndBenefits;
    }

    for (let idx = benefits?.length - 1 ?? -1; idx >= 0; idx--) {
      pushIfAvailable(benefits[idx]);
      if (topNRewardsAndBenefits.length === TOP_N_REWARDS_AND_BENEFITS)
        return topNRewardsAndBenefits;
    }

    return topNRewardsAndBenefits;
  }

  public async getPointsAndMedal(
    gcdCode: string,
    roleId: number
  ): Promise<any> {
    try {
      if (!gcdCode) {
        throw new Error("gcdCode not present");
      }

      if (roleId != PosRoles.Agent) {
        Logger.debug(
          `gcdCode ${gcdCode} not a pos agent having posRole ${roleId}`
        );
        return {};
      }
      const pointsInfo = await this.getPointsBreakup(gcdCode);
      pointsInfo.medal = pointsInfo.clubDetails.currentClub;
      return pointsInfo;
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in get points and club service", { error });
      return {};
    }
  }

  public async getPointsList(query: any): Promise<any> {
    const projections = POINTS_LIST_PROJECTION;

    query = {
      ...query,
      projections,
    };
    const options = {
      config: {},
      endpoint: `${process.env.PMS_ENDPOINT}/api/v1/points`,
    };
    const response: any = await this.commonApiHelper.fetchData(options, query);
    const { points, hasNext, nextCursor } = response.data;

    const formattedPoints = points?.reduce((acc: any, item) => {
      const { allocationDate, metaData, point } = item;
      const dateKey = new Date(allocationDate).toLocaleDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      const updatedPointsData = {
        points: point,
        category: metaData.product,
        medium: metaData?.policyMedium,
        premium: metaData?.premium,
        details:
          metaData?.vehicleRegistrationNumber ||
          metaData?.policyNumber ||
          metaData?.clientName ||
          metaData?.description,
      };
      acc[dateKey].push(updatedPointsData);
      return acc;
    }, {});

    return { points: formattedPoints, pagination: { hasNext, nextCursor } };
  }

  public async getPointsBreakup(query: any): Promise<any> {
    const options = {
      config: {},
      endpoint: `${process.env.PMS_ENDPOINT}/api/v1/points/breakup`,
    };

    const response: any = await this.commonApiHelper.fetchData(options, query);

    const financialYear = DateTimeUtils.getFinancialEndYearFromCurrentDate(),
      total = response.data.totalPoints,
      totalBreakup = response.data.totalBreakup;

    const clubDetails = await this.getUserClubDetails(total);
    const displayPoints = CommonUtils.valueToFigure(total, 100);
    const result = {
      total,
      displayPoints,
      totalBreakup,
      clubDetails,
      financialYear,
    };

    return result;
  }

  private async getUserClubDetails(total: number) {
    const { clubDetails } = await this.getClubsDetail();

    const sortedClubs = clubDetails?.sort(
      (club1, club2) => club1.index - club2.index
    );

    const currentClub = this.getCurrentClub(total, sortedClubs),
      currentClubIndex = sortedClubs.indexOf(currentClub),
      nextClub = this.getNextClub(currentClubIndex, sortedClubs),
      pointsLeftForNextClub = this.getPointsLeftForNextClub(total, nextClub),
      currentClubBenefits = currentClub.benefits,
      currentClubRewards = currentClub.rewards,
      nextClubRewards = nextClub?.rewards || null,
      nextClubBenefits = nextClub?.benefits || null,
      nextNearestTripDetails = this.findNearestClubWithTrip(
        currentClubIndex,
        sortedClubs
      ),
      topNRewardsAndBenefits = this.gettopNRewardsAndBenefits(
        nextClubRewards,
        nextClubBenefits,
        currentClubBenefits
      );
    return {
      currentClubIndex: currentClub.index,
      currentClub: currentClub.name,
      currentClubMedalImage: currentClub?.imageLink,
      nextClubMedalImage: nextClub?.imageLink,
      pointsLabel: currentClub.pointsLabel,
      nextClub: nextClub ? nextClub.name : null,
      pointsLeftForNextClub,
      benefits: currentClubBenefits,
      rewards: currentClubRewards,
      nextClubRewards,
      nextClubBenefits,
      nextNearestTripDetails,
      topNRewardsAndBenefits,
    };
  }

  public async getClubsDetail() {
    const {
      clubDetails,
      benefitsDetails,
    }: { clubDetails: ClubDetailsInteface[]; benefitsDetails: any } =
      await this.configService.getConfigValueByKey(ACHIEVERS_CLUB_CLUBS_DETAIL);

    return { clubDetails, benefitsDetails };
  }
}
