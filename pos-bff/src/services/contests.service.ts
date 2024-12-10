import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { ConfigService } from "@nestjs/config";
import moment from "moment";
import {
  CONTEST_SOURCE,
  ContestViews,
  HIERARCHY_VIEWS,
  KPI_VS_IMAGE_TYPE,
  KpiKeys,
  KURUKSHETRA_AGENT_FILTERS,
  KURUKSHETRA_AGENT_PROJECTIONS,
  LOGICAL_OPERATOR_DISPLAY_MAP,
  LogicalOperators,
  PARTICIPANT_VIEWS,
  SALES_ELIGIBILITY_RELEVANT_FIELDS,
  SALES_REQUIRED_FIELD_PATHS,
  Tabs,
  TABS_VS_VALUES,
  VIEW_VS_ROUTES,
  VIEWS_VS_PROJECTIONS,
  VIEWS_VS_ROLES,
} from "@/src/constants/contests.constants";
import CommonUtils from "@/src/utils/common-utils";
import _ from "lodash";
import { GetContestsQuery } from "@/src/interfaces/contests/get-contests.interface";
import { Roles } from "@/src/constants/roles.constants";
import SalesService from "@/src/services/sales-service";
import DealerService from "@/src/services/dealer-service";
import { UseCache } from "@/src/decorators/use-cache.decorator";
import { PosRoles, SalesRoles } from "@/src/constants/pos-roles.constants";
import { GetContestDto } from "@/src/dtos/contests/get-contests.dto";
import { ContestResponse } from "@/src/interfaces/contests/contests-response.interface";
import DashboardService from "@/src/services/dashboard-service";

@Injectable()
export default class ContestService {
  constructor(
    private apiHelper: CommonApiHelper,
    private configService: ConfigService,
    private salesService: SalesService,
    private dealerService: DealerService,
    private dashboardService: DashboardService
  ) {}

  private constestServiceEndpoint =
    this.configService.get("PMS_ENDPOINT") + "/api/v1/contests";

  public authenticateView(query: any, userInfo: any) {
    const { pos_role_id: roleId } = userInfo;
    const { view } = query;

    if (
      !VIEWS_VS_ROLES[view].find(
        (allowedRole: number) => allowedRole === roleId
      )
    ) {
      /*TODO: to be uncommented when we go live*/
      // throw new UnauthorizedException(
      //   "user role does not have access to the requested view"
      // );
    }
  }

  public async getContestsConfig(userInfo) {
    const { pos_role_id: roleId } = userInfo;
    let tabs = [];

    if (roleId === PosRoles.Agent) {
      tabs = [
        TABS_VS_VALUES[Tabs.ACTIVE_CONTESTS],
        TABS_VS_VALUES[Tabs.PAST_CONTESTS],
      ];
    }

    if (Roles.POS_SALES_ALL.includes(roleId)) {
      tabs = [
        TABS_VS_VALUES[Tabs.ACTIVE_CONTESTS],
        TABS_VS_VALUES[Tabs.PAST_CONTESTS],
        TABS_VS_VALUES[Tabs.AGENT_CONTESTS],
        TABS_VS_VALUES[Tabs.TEAM_CONTESTS],
      ];
    }

    if (roleId === PosRoles.SuperAdmin) {
      tabs = [
        TABS_VS_VALUES[Tabs.ACTIVE_CONTESTS],
        TABS_VS_VALUES[Tabs.UPCOMING_CONTESTS],
        TABS_VS_VALUES[Tabs.PAST_CONTESTS],
      ];
    }

    return { tabs };
  }

  public async getContests(query: GetContestDto, userInfo: any) {
    const { view } = query;
    const params = await this.buildFetchContestsParams(query, userInfo);
    let { contests } = await this.fetchContestsData(params);

    contests = this.buildContestResponse(contests, view);

    return {
      contests,
    };
  }

  private async buildFetchContestsParams(query: GetContestDto, userInfo: any) {
    const { contestId, view, tabSelected, attributes } = query;
    let params: GetContestsQuery = {
      source: CONTEST_SOURCE,
      projections: VIEWS_VS_PROJECTIONS[view],
    };

    if (contestId) {
      params.contestId = contestId;
    }

    if (!!tabSelected) {
      const tabSelectedParams =
        this.buildTimeAndAttributeSelection(tabSelected);
      params = { ...params, ...tabSelectedParams };
    }

    if (PARTICIPANT_VIEWS.includes(view)) {
      const participantParams = await this.buildParticipantQuery(userInfo);
      params = { ...params, ...participantParams };
    }

    if (HIERARCHY_VIEWS.includes(view)) {
      const hierarchyParams = await this.buildHierarchyQuery(userInfo);
      params = { ...params, ...hierarchyParams };
    }

    if (attributes && Object.keys(attributes)) {
      params.attributes = JSON.stringify(attributes);
    }

    return params;
  }

  private buildTimeAndAttributeSelection(
    tabSelected: Tabs
  ): Partial<GetContestsQuery> {
    const filters: Partial<GetContestsQuery> = {};
    const currentDateTime = new Date();

    if (tabSelected === Tabs.ACTIVE_CONTESTS) {
      filters.startDateTimeTill = currentDateTime;
      filters.endDateTimeFrom = currentDateTime;
    }

    if (tabSelected === Tabs.PAST_CONTESTS) {
      filters.endDateTimeTill = currentDateTime;
    }

    if (tabSelected === Tabs.UPCOMING_CONTESTS) {
      filters.startDateTimeFrom = currentDateTime;
    }

    if (tabSelected === Tabs.AGENT_CONTESTS) {
      filters.startDateTimeTill = currentDateTime;
      filters.endDateTimeFrom = currentDateTime;
      filters.attributes = {
        userType: "agent",
      };
    }

    if (tabSelected === Tabs.TEAM_CONTESTS) {
      filters.startDateTimeTill = currentDateTime;
      filters.endDateTimeFrom = currentDateTime;
      filters.attributes = {
        userType: "sales",
      };
    }

    if (!!filters.attributes) {
      filters.attributes = JSON.stringify(filters.attributes);
    }

    return filters;
  }

  private async buildParticipantQuery(userInfo: any) {
    const { pos_role_id: roleId, gcd_code: gcdCode, uuid } = userInfo;
    const query: Partial<GetContestsQuery> = {
      participantIdentifier: "",
      eligibility: {
        roleId,
      },
    };

    const participantIdentifier = this.generateParticipantIdentifier(userInfo);
    if (!!participantIdentifier) {
      query.participantIdentifier = participantIdentifier;
    }

    if (roleId === Roles.POS_AGENT) {
      const eligibility = await this.generateAgentEligibility(gcdCode);
      query.eligibility = { ...query.eligibility, ...eligibility };
    }
    if (Roles.POS_SALES_ALL.includes(roleId)) {
      const eligibility = await this.generateSalesEligibility(uuid);
      query.eligibility = { ...query.eligibility, ...eligibility };
    }

    query.eligibility = JSON.stringify(query.eligibility);
    return query;
  }

  private generateParticipantIdentifier(userInfo: Record<string, any>) {
    const {
      pos_role_id: roleId,
      gcd_code: gcdCode,
      employee_id: employeeId,
    } = userInfo;
    if (roleId === Roles.POS_AGENT) {
      return gcdCode;
    }
    if (Roles.POS_SALES_ALL.includes(roleId)) {
      return employeeId;
    }
  }

  private async buildHierarchyQuery(userInfo) {
    const { pos_role_id: roleId, employee_id: employeeId, uuid } = userInfo;
    const query: Partial<GetContestsQuery> = {
      hierarchyIdentifier: employeeId,
      hierarchyEligibility: {
        roleId,
      },
    };

    const eligibility = await this.generateSalesEligibility(uuid);
    query.hierarchyEligibility = {
      ...query.hierarchyEligibility,
      ...eligibility,
    };

    query.hierarchyEligibility = JSON.stringify(query.hierarchyEligibility);
    return query;
  }

  @UseCache({ expiryTimer: 60 * 60 * 24 })
  private async generateAgentEligibility(gcdCode: string) {
    const params = {
      gcd_code: gcdCode,
      getAgentMapping: true,
    };

    let dealerDetails = await this.dealerService.getDealerDetailsV2(params);
    if (!dealerDetails?.data?.[0]) {
      throw new InternalServerErrorException(
        `dealer details not found for ${gcdCode}`
      );
    }

    dealerDetails = dealerDetails?.data?.[0];
    dealerDetails.properties = JSON.parse(dealerDetails.properties ?? {});
    dealerDetails.hierarchy = this.flattenHierarchy(
      dealerDetails?.sales_agents
    );
    delete dealerDetails.sales_agents;

    return dealerDetails;
  }

  @UseCache({ expiryTimer: 60 * 60 * 24 })
  private async generateSalesEligibility(uuid: string) {
    const params = {
      iam_uuid: uuid,
      getSalesMapping: true,
    };

    let salesDetails = await this.salesService.getSfaUsers(params);
    if (!salesDetails?.data?.[0]) {
      throw new InternalServerErrorException(
        `sales details not found for iamUuid: ${uuid}`
      );
    }

    salesDetails = salesDetails?.data?.[0];
    salesDetails.hierarchy = this.flattenHierarchy(salesDetails?.sales_agents);
    delete salesDetails.sales_agents;
    salesDetails = _.pick(salesDetails, SALES_ELIGIBILITY_RELEVANT_FIELDS);

    return salesDetails;
  }

  private flattenHierarchy(
    hierarchy: Record<string, Record<string, number | string>[]>
  ) {
    if (!hierarchy || !_.isObject(hierarchy)) {
      return [];
    }
    const flatHierarchy = [];
    const teamsTagged = Object.keys(hierarchy);

    teamsTagged.forEach((teamUuid) => {
      const salesUsersAboveUser = hierarchy[teamUuid];
      if (!salesUsersAboveUser || !Array.isArray(salesUsersAboveUser)) {
        return;
      }

      salesUsersAboveUser.forEach((salesPerson) => {
        const { employee_id: employeeId } = salesPerson ?? {};

        salesPerson = _.pick(salesPerson, SALES_REQUIRED_FIELD_PATHS);
        const identifier = `${employeeId}_${teamUuid}`;
        salesPerson["identifier"] = identifier;
        salesPerson["team_uuid"] = teamUuid;

        flatHierarchy.push(salesPerson);
      });
    });

    return flatHierarchy;
  }

  public async fetchContestsData(params: Record<string, any>) {
    const options = {
      endpoint: this.constestServiceEndpoint,
    };

    const data: any = await this.apiHelper.fetchData(options, params);
    return data?.data;
  }

  private buildContestResponse(contests: any[], view: ContestViews) {
    return contests.map((contest) => {
      const {
        contestId,
        name,
        startDateTime,
        endDateTime,
        milestones,
        userPerfomance,
        userPerfomanceWithRank,
        totalParticipants,
        contestPerfomance,
        weightages,
      } = contest;
      const { milestoneAchievedIndex, performance, participant } =
        userPerfomance ?? userPerfomanceWithRank ?? {};

      milestones.sort(
        (firstMilestone, secondMilestone) =>
          firstMilestone.index - secondMilestone.index
      );

      const rewardImages = this.extractRewardImages(milestones);
      const startDate = this.convertDateToDayMonthString(startDateTime);
      const endDate = this.convertDateToDayMonthString(endDateTime);
      const actionLink = `${VIEW_VS_ROUTES[view]}?contestId=${contestId}`;

      const contestResponse: any = {
        rewardImages,
        startDate,
        endDate,
        name: name.trim(),
        actionLink,
        totalParticipants,
        milestones,
        milestoneAchievedIndex,
      };

      if (!!userPerfomance || !!userPerfomanceWithRank) {
        const progress = this.generateProgess(
          milestones,
          milestoneAchievedIndex
        );
        const achievements = this.generateAchievement(performance);

        contestResponse.progressBar = progress;
        contestResponse.achievements = achievements;
        contestResponse.participant = participant;
        contestResponse.perfomance = performance?.map(({ value, name }) => {
          return {
            value: CommonUtils.valueToFigure(value),
            name,
          };
        });
      }

      if (!!userPerfomanceWithRank) {
        const { rank } = userPerfomanceWithRank;
        contestResponse.rank = rank;
      }

      if (!!contestPerfomance) {
        contestResponse.contestPerfomance = contestPerfomance;
      }

      if (!!weightages) {
        const weightagesTable = this.generateWeightagesTableAndMap(weightages);
        contestResponse.weightages = weightagesTable;
      }

      return contestResponse;
    });
  }

  private retrieveTimeLeft(endTime: string | Date) {
    const currentDate = moment.utc();
    const endDate = moment.utc(endTime);

    const monthsLeft = endDate.diff(currentDate, "months");
    const daysLeft = endDate.diff(
      currentDate.add(monthsLeft, "months"),
      "days"
    );

    return { monthsLeft, daysLeft };
  }

  private extractRewardImages(milestones: any[]): string[] {
    const images = [];
    milestones.forEach((milestone) => {
      if (!milestone?.rewards) {
        return;
      }

      const { rewards } = milestone;
      rewards?.forEach((reward) => {
        if (!!reward.imageLink) {
          images.push(reward.imageLink);
        }
      });
    });

    return images;
  }

  private generateWeightagesTableAndMap(weightages: any[]) {
    const headersSet = this.generateWeightagesTableHeader(weightages);
    const body = this.generateWeightagesTableBody(weightages, headersSet);
    const headersList = this.generateWeightageHeaderList(headersSet);
    headersList.push("Weightage");
    const weightagesMap = this.generateWeightageMap(headersList, body);

    return { body, headers: headersList, weightagesMap };
  }

  private generateWeightagesTableHeader(weightages: any[]) {
    const headers = new Set(["Product"]);

    weightages?.forEach(({ rules }) => {
      const facts = rules?.all ?? [];
      facts.forEach(({ name }) => {
        headers.add(name);
      });
    });

    return headers;
  }

  private generateWeightagesTableBody(weightages: any[], headers: Set<string>) {
    const body = [];

    weightages?.forEach(({ rules, weight }) => {
      const facts = rules?.all ?? rules.any ?? [];
      const weightageBody = [];

      for (const header of headers) {
        const fact = facts.find(({ name }) => name === header);

        let factValue = fact?.displayValue ?? fact?.value ?? "";
        factValue = Array.isArray(factValue) ? fact.toString() : factValue;
        weightageBody.push(factValue);
      }
      weightageBody.push(weight);

      body.push(weightageBody);
    });

    return body;
  }

  private generateWeightageHeaderList(headers: Set<string>) {
    const headerList = Array.from(headers);
    return headerList.map((header) => {
      return _.startCase(_.toLower(header));
    });
  }

  private generateWeightageMap(headers: string[], body: string[][]) {
    const weightageMapList: Record<string, string>[] = [];

    body.forEach((row) => {
      const weightageMap: Record<string, string> = {};

      row.forEach((value, index) => {
        weightageMap[headers[index]] = value;
      });

      weightageMapList.push(weightageMap);
    });

    return weightageMapList;
  }

  private convertDateToDayMonthString(dateString: string) {
    const date = moment.utc(dateString).local();
    const month = date.format("MMM");
    const day = date.format("D");
    return `${day} ${month}`;
  }

  private generateProgess(milestones: any[], milestoneAchievedIndex: number) {
    const totalMilestones = milestones?.length || 0;

    return milestones.map((milestone) => {
      const { conditions, index } = milestone;
      const achievementCondition =
        this.generateAchievementCondition(conditions);

      const percentage = ((index * 1.0) / totalMilestones) * 100;
      const isAchieved = milestoneAchievedIndex >= index;

      return {
        isAchieved,
        achievementCondition,
        percentage,
      };
    });
  }

  private findCountLeftForNextMilestone(
    achievementTillNow: number,
    milestones: any[],
    milestoneAchievedIndex: number
  ) {
    const response = {
      countLeft: null,
    };

    const nextMilestone = milestones.find(
      ({ index }) => index > milestoneAchievedIndex
    );

    if (nextMilestone) {
      response.countLeft =
        this.getNextMilestoneValue(nextMilestone) - achievementTillNow;
    }

    return response;
  }

  private getNextMilestoneValue(milestone: Record<string, any>) {
    const { conditions } = milestone;
    return conditions?.all?.[0]?.value ?? conditions?.any?.[0]?.value;
  }

  /*
  - will work only for one level of nesting
  */
  private generateAchievementCondition(condition: Record<string, any>) {
    let facts = [];
    let joiningOperator = "";

    if (condition?.all) {
      facts = condition.all;
      joiningOperator = LogicalOperators.AND;
    }
    if (condition?.any) {
      facts = condition.any;
      joiningOperator = LogicalOperators.OR;
    }

    const filteredFacts = facts.map((fact) => {
      const { operator, value, name } = fact;
      return {
        value,
        name,
        operator,
      };
    });

    return {
      facts: filteredFacts,
      joiningOperator: LOGICAL_OPERATOR_DISPLAY_MAP[joiningOperator],
    };
  }

  private generateAchievement(performanceList: Record<string, number>[]) {
    return performanceList.map((perfomance) => {
      const { value, name, key: kpiKey } = perfomance;
      const displayValue = CommonUtils.valueToFigure(value);
      const type = KPI_VS_IMAGE_TYPE[kpiKey];

      return {
        type,
        value: displayValue,
        title: name,
      };
    });
  }

  public async getLeaderboard(query, userInfo) {
    const { contestId, hierarchyIdentifiers } = query;

    const leaderboardQuery: Record<string, any> = {
      contestId,
      projections: "kpisWithValue",
    };
    if (!!hierarchyIdentifiers) {
      leaderboardQuery.hierarchyIdentifiers = hierarchyIdentifiers;
    }

    const { participants: participantsPerfomance } =
      await this.fetchLeaderboard(leaderboardQuery);

    const kpis = participantsPerfomance?.[0]?.kpiListWithValues;
    const tableHeaders = kpis?.map((kpi) => {
      return kpi?.name;
    });
    const participantIdentifier = this.generateParticipantIdentifier(userInfo);

    const leaderboard = participantsPerfomance?.map(
      ({ participant, rank, kpiListWithValues }) => {
        const { name, identifier } = participant;
        const metrics = kpiListWithValues.map(({ value, name }) => {
          return {
            value: CommonUtils.valueToFigure(value),
            name,
          };
        });

        return {
          name,
          identifier,
          rank,
          metrics,
          isUserInLeaderboard: identifier === participantIdentifier,
        };
      }
    );

    return {
      leaderboard,
      tableHeaders,
    };
  }

  public async generateHierarchyIdentifiers(userInfo: Record<string, any>) {
    const { team_rm_mapping, employee_id } = userInfo;
    const teamsTagged = team_rm_mapping?.map(({ team_uuid }) => team_uuid);

    return teamsTagged.map((teamTagged: string) => {
      return `${employee_id}_${teamTagged}`;
    });
  }

  public async fetchLeaderboard(params: Record<string, string>) {
    const options = {
      endpoint: this.constestServiceEndpoint + "/perfomances",
    };

    const data: any = await this.apiHelper.fetchData(options, params);
    return data?.data;
  }

  public async getKurukshetraContest(query: GetContestDto, userInfo: any) {
    const params = await this.buildFetchContestsParams(query, userInfo);
    const { contests } = await this.fetchContestsData(params);
    const firstContest = contests?.[0];
    if (!firstContest) {
      return {};
    }

    if (userInfo.pos_role_id === PosRoles.Agent) {
      return this.buildAgentResponse(firstContest, userInfo.uuid);
    }

    if (SalesRoles.includes(userInfo.pos_role_id)) {
      return this.buildSalesResponse(firstContest);
    }

    return contests;
  }

  private async buildAgentResponse(contest: ContestResponse, iamUuid: string) {
    const { endDateTime, milestones, userPerfomance } = contest;

    const { monthsLeft, daysLeft } = this.retrieveTimeLeft(endDateTime);

    milestones.sort(
      (firstMilestone, secondMilestone) =>
        firstMilestone.index - secondMilestone.index
    );
    const { performance, milestoneAchievedIndex } = userPerfomance ?? {};
    const nop = performance?.find(({ key }) => key === KpiKeys.NOP)?.value;

    const nextMilestoneConditions = this.findCountLeftForNextMilestone(
      nop,
      milestones,
      milestoneAchievedIndex
    );
    const renewalPerformance = await this.getAgentHealthRenewalPerformance(
      iamUuid
    );

    const actionLink = `/core/contests/kurukshetra`;

    return {
      monthsLeft,
      daysLeft,
      actionLink,
      nextMilestoneConditions,
      milestoneAchievedIndex,
      nop,
      renewalPerformance,
    };
  }

  private async getAgentHealthRenewalPerformance(iamUuid: string) {
    let target = 0,
      achievement = 0;
    const response = {
      percentageAchieved: 0,
      showProgressBar: false,
    };

    try {
      const promises = KURUKSHETRA_AGENT_FILTERS.map(
        ({ startDate, endDate }) => {
          const body = {
            filters: {
              start_date: startDate,
              end_date: endDate,
              dealer_iam_uuid: iamUuid,
              lob: "Health",
            },
            projections: KURUKSHETRA_AGENT_PROJECTIONS,
          };

          return this.dashboardService.fetchCardsData(
            startDate,
            endDate,
            null,
            iamUuid,
            "Health",
            KURUKSHETRA_AGENT_PROJECTIONS,
            body
          );
        }
      );

      const responses = await Promise.all(promises);

      responses.forEach(({ data }) => {
        let { nop_renewed: nopRenewed, nop_to_be_renewed: nopToBeRenewed } =
          data;

        nopRenewed = typeof nopRenewed === "number" ? nopRenewed : 0;
        nopToBeRenewed =
          typeof nopToBeRenewed === "number" ? nopToBeRenewed : 0;

        achievement += nopRenewed;
        target += nopRenewed + nopToBeRenewed;
      });
    } catch (error) {
      Logger.error(
        "unable to retrieve renewal target for agent for kurukshetra",
        { error }
      );
    }
    if (!target) {
      return response;
    }

    response.showProgressBar = true;
    response.percentageAchieved = ((achievement * 1.0) / target) * 100;
    return response;
  }

  private async buildSalesResponse(contest: ContestResponse) {
    const {
      startDateTime,
      milestones,
      userPerfomanceWithRank,
      timeFrames,
      contestId,
      additionalData,
    } = contest;
    const { targets, timeFramesPerformance, rank, participant, performance } =
      userPerfomanceWithRank;
    const rules = additionalData?.rules ?? [];
    const showAdditionalRules = !!additionalData?.showAdditionalRules;
    const { name } = participant;
    const totalPremiumSourced = CommonUtils.valueToFigure(
      performance?.[0]?.value,
      10,
      true
    );
    const currentTime = moment().toISOString();
    timeFrames.sort(
      (firstTimeFrame, secondTimeFrame) =>
        firstTimeFrame.index - secondTimeFrame.index
    );
    const currentTimeFrame = timeFrames.find(
      ({ startDateTime, endDateTime }) =>
        currentTime >= startDateTime && currentTime <= endDateTime
    );

    const { monthsLeft, daysLeft } = this.retrieveTimeLeft(
      currentTimeFrame.endDateTime
    );
    const performances = this.generatePerformances(
      timeFramesPerformance,
      targets,
      milestones,
      currentTimeFrame,
      timeFrames
    );

    const leaderboardResponse = await this.fetchLeaderboard({
      contestId,
      projections: "kpisWithValue",
    });
    const { participants } = leaderboardResponse;
    const leaderboard = participants
      .filter(({ rank: leaderboardRank }) => {
        return leaderboardRank !== rank;
      })
      .map((participant: Record<string, any>) => {
        const { participant: participantInfo, rank, performance } = participant;
        const { name } = participantInfo;

        return {
          name,
          rank,
          value: CommonUtils.valueToFigure(performance?.metric1, 10, true),
        };
      });

    return {
      monthsLeft,
      daysLeft,
      currentTimeFrame,
      performances,
      startDateTime,
      rank,
      leaderboard,
      name,
      totalPremiumSourced,
      rules,
      showAdditionalRules,
    };
  }

  private generatePerformances(
    timeFramesPerformances: any[],
    targets: any[],
    milestones: any[],
    currentTimeFrame: any,
    timeFrames: any[]
  ) {
    const perfomances = [];
    let latestMilestoneIndex = 0;

    targets.forEach((target, index) => {
      const perfomance = timeFramesPerformances[index];
      const { milestoneTargets } = target;
      const {
        cashComponent,
        performance: timeFramesPerformance,
        milestoneAchievedIndex,
        timeFrameIndex,
      } = perfomance;
      const currentAchievement = timeFramesPerformance?.[0]?.value || 0;
      const premiumTarget = milestoneTargets?.premium;
      const targetLeft =
        premiumTarget > currentAchievement
          ? premiumTarget - currentAchievement
          : null;
      const phase = timeFrameIndex - currentTimeFrame.index;
      const achievementPercentage =
        currentAchievement && premiumTarget
          ? Math.min(((currentAchievement * 1.0) / premiumTarget) * 100, 100)
          : 0;
      const timeFrameName = timeFrames.find(
        ({ index }) => index === timeFrameIndex
      )?.name;

      if (phase < 0) {
        latestMilestoneIndex = milestoneAchievedIndex || 0;
      } else if (phase >= 0) {
        latestMilestoneIndex++;
      }

      const currentMilestone = milestones.find(({ index }) => {
        return index === latestMilestoneIndex;
      });
      const multiplier = currentMilestone?.cashComponent?.multiplier
        ? currentMilestone?.cashComponent?.multiplier * 100
        : null;
      const potentialEarnings = targetLeft
        ? Math.floor(
            currentAchievement *
              (currentMilestone?.cashComponent?.multiplier ?? 0)
          )
        : null;

      perfomances.push({
        target: CommonUtils.valueToFigure(premiumTarget, 10, true),
        targetLeft: CommonUtils.valueToFigure(targetLeft, 10, true),
        currentAchievement: CommonUtils.valueToFigure(
          currentAchievement,
          10,
          true
        ),
        achievementPercentage,
        cashComponent: parseInt(cashComponent || 0),
        multiplier,
        phase,
        timeFrameName,
        potentialEarnings,
      });
    });

    return perfomances;
  }
}
