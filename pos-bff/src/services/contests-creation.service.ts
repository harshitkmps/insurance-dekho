import { PrimitiveOperators } from "@/src/constants/contests.constants";
import { PosRoles } from "@/src/constants/pos-roles.constants";
import { CreateContestDto } from "@/src/dtos/contests/create-contests.dto";
import ApiPosService from "@/src/services/apipos-service";
import CommonUtils from "@/src/utils/common-utils";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export default class ContestsCreationService {
  constructor(private apiPosService: ApiPosService) {}

  public async getUIConfig() {
    return {
      eventVsProducts: [
        {
          products: [
            {
              label: "Car",
              value: "car",
              subProductId: 1,
              additionalFilters: [
                {
                  label: "Policy Medium",
                  key: "policy_medium",
                  options: [
                    { label: "Online", value: "online" },
                    { label: "Offline", value: "offline" },
                  ],
                  value: [],
                },
                {
                  label: "Case Type",
                  key: "request_type",
                  options: [
                    { label: "Inspected", value: "Inspected" },
                    { label: "New", value: "New" },
                    { label: "Renewal", value: "Renewal" },
                    { label: "Renewal Breakin", value: "Renewal Breakin" },
                    { label: "Used", value: "Used" },
                  ],
                  value: [],
                },
                {
                  label: "Insurance Company",
                  key: "insurer_id",
                  value: [],
                },
                {
                  label: "Policy Type",
                  key: "policy_type",
                  value: [],
                  options: [
                    { label: "Comprehensive", value: "comprehensive" },
                    { label: "Own Damage", value: "own_damage" },
                    { label: "Third Party", value: "third_party" },
                  ],
                },
              ],
              isSelected: false,
            },
            {
              label: "Bike",
              value: "bike",
              subProductId: 1,
              additionalFilters: [
                {
                  label: "Policy Medium",
                  key: "policy_medium",
                  options: [
                    { label: "Online", value: "online" },
                    { label: "Offline", value: "offline" },
                  ],
                  value: [],
                },
                {
                  label: "Case Type",
                  key: "request_type",
                  options: [
                    { label: "Inspected", value: "Inspected" },
                    { label: "New", value: "New" },
                    { label: "Renewal", value: "Renewal" },
                    { label: "Renewal Breakin", value: "Renewal Breakin" },
                    { label: "Used", value: "Used" },
                  ],
                  value: [],
                },
                {
                  label: "Insurance Company",
                  key: "insurer_id",
                  value: [],
                },
                {
                  label: "Policy Type",
                  key: "policy_type",
                  value: [],
                  options: [
                    { label: "Comprehensive", value: "comprehensive" },
                    { label: "Own Damage", value: "own_damage" },
                    { label: "Third Party", value: "third_party" },
                  ],
                },
              ],
              isSelected: false,
            },
            {
              label: "PCV",
              value: "pcv",
              subProductId: 1,
              additionalFilters: [
                {
                  label: "Policy Medium",
                  key: "policy_medium",
                  options: [
                    { label: "Online", value: "online" },
                    { label: "Offline", value: "offline" },
                  ],
                  value: [],
                },
                {
                  label: "Case Type",
                  key: "request_type",
                  options: [
                    { label: "Inspected", value: "Inspected" },
                    { label: "New", value: "New" },
                    { label: "Renewal", value: "Renewal" },
                    { label: "Renewal Breakin", value: "Renewal Breakin" },
                    { label: "Used", value: "Used" },
                  ],
                  value: [],
                },
                {
                  label: "Insurance Company",
                  key: "insurer_id",
                  value: [],
                },
                {
                  label: "Policy Type",
                  key: "policy_type",
                  value: [],
                  options: [
                    { label: "Comprehensive", value: "comprehensive" },
                    { label: "Own Damage", value: "own_damage" },
                    { label: "Third Party", value: "third_party" },
                  ],
                },
              ],
              isSelected: false,
            },
            {
              label: "GCV",
              value: "gcv",
              subProductId: 1,
              additionalFilters: [
                {
                  label: "Policy Medium",
                  key: "policy_medium",
                  options: [
                    { label: "Online", value: "online" },
                    { label: "Offline", value: "offline" },
                  ],
                  value: [],
                },
                {
                  label: "Case Type",
                  key: "request_type",
                  options: [
                    { label: "Inspected", value: "Inspected" },
                    { label: "New", value: "New" },
                    { label: "Renewal", value: "Renewal" },
                    { label: "Renewal Breakin", value: "Renewal Breakin" },
                    { label: "Used", value: "Used" },
                  ],
                  value: [],
                },
                {
                  label: "Insurance Company",
                  key: "insurer_id",
                  value: [],
                },
                {
                  label: "Policy Type",
                  key: "policy_type",
                  value: [],
                  options: [
                    { label: "Comprehensive", value: "comprehensive" },
                    { label: "Own Damage", value: "own_damage" },
                    { label: "Third Party", value: "third_party" },
                  ],
                },
              ],
              isSelected: false,
            },
            {
              label: "Misc",
              value: "misc",
              subProductId: 1,
              additionalFilters: [
                {
                  label: "Policy Medium",
                  key: "policy_medium",
                  options: [
                    { label: "Online", value: "online" },
                    { label: "Offline", value: "offline" },
                  ],
                  value: [],
                },
                {
                  label: "Case Type",
                  key: "request_type",
                  options: [
                    { label: "Inspected", value: "Inspected" },
                    { label: "New", value: "New" },
                    { label: "Renewal", value: "Renewal" },
                    { label: "Renewal Breakin", value: "Renewal Breakin" },
                    { label: "Used", value: "Used" },
                  ],
                  value: [],
                },
                {
                  label: "Insurance Company",
                  key: "insurer_id",
                  value: [],
                },
                {
                  label: "Policy Type",
                  key: "policy_type",
                  value: [],
                  options: [
                    { label: "Comprehensive", value: "comprehensive" },
                    { label: "Own Damage", value: "own_damage" },
                    { label: "Third Party", value: "third_party" },
                  ],
                },
              ],
              isSelected: false,
            },
            {
              label: "Health",
              value: "health",
              subProductId: 4,
              additionalFilters: [
                {
                  label: "Policy Medium",
                  key: "policy_medium",
                  options: [
                    { label: "Online", value: "online" },
                    { label: "Offline", value: "offline" },
                  ],
                  value: [],
                },
                {
                  label: "Case Type",
                  key: "request_type",
                  options: [
                    { label: "New", value: "New" },
                    { label: "Port", value: "Port" },
                    { label: "Port Fresh", value: "Port Fresh" },
                    { label: "Port Renewal", value: "Port Renewal" },
                    { label: "Renew", value: "Renew" },
                  ],
                  value: [],
                },
                {
                  label: "Insurance Company",
                  key: "insurer_id",
                  value: [],
                },
                {
                  label: "Plans",
                  key: "plan_id",
                  value: [],
                },
              ],
              isSelected: false,
            },
            {
              label: "Life",
              value: "life",
              subProductId: 5,
              additionalFilters: [
                {
                  label: "Policy Medium",
                  key: "policy_medium",
                  options: [
                    { label: "Online", value: "online" },
                    { label: "Offline", value: "offline" },
                  ],
                  value: [],
                },
                {
                  label: "Case Type",
                  key: "request_type",
                  options: [
                    { label: "New", value: "New" },
                    { label: "Port", value: "Port" },
                    { label: "Port Fresh", value: "Port Fresh" },
                    { label: "Port Renewal", value: "Port Renewal" },
                    { label: "Renew", value: "Renew" },
                  ],
                  value: [],
                },
                {
                  label: "Insurance Company",
                  key: "insurer_id",
                  value: [],
                },
                {
                  label: "Plans",
                  key: "plan_id",
                  value: [],
                },
              ],
              isSelected: false,
            },
          ],
          kpis: [
            {
              label: "Number of Policies",
              key: "nop",
              aggregationType: "count",
              isSelected: false,
            },
            {
              label: "Premium",
              key: "premium",
              aggregationType: "sum",
              isSelected: false,
            },
          ],
          label: "Policy",
          value: "policy",
          isSelected: false,
        },
        {
          products: [
            {
              label: "Bike",
              value: "bike",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "Car",
              value: "car",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "PCV",
              value: "pcv",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "gcv",
              value: "GCV",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "Misc",
              value: "misc",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "Health",
              value: "health",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "Life",
              value: "life",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "Travel",
              value: "travel",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "SME",
              value: "sme",
              isSelected: false,
              additionalFilters: [],
            },
          ],
          kpis: [
            {
              label: "Activations",
              aggregationType: "count",
              key: "activations",
              isSelected: false,
            },
          ],
          label: "Monthly Activations",
          value: "activation",
          isSelected: false,
        },
        {
          products: [
            {
              label: "Bike",
              value: "bike",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "Car",
              value: "car",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "PCV",
              value: "pcv",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "gcv",
              value: "GCV",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "Misc",
              value: "misc",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "Health",
              value: "health",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "Life",
              value: "life",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "Travel",
              value: "travel",
              isSelected: false,
              additionalFilters: [],
            },
            {
              label: "SME",
              value: "sme",
              isSelected: false,
              additionalFilters: [],
            },
          ],
          kpis: [
            {
              label: "First Time Activations",
              aggregationType: "count",
              key: "firstTimeActivations",
              isSelected: false,
            },
          ],
          label: "First Time Activations",
          value: "firstTimeActivation",
          isSelected: false,
        },
      ],
    };
  }

  public async getContestCreationConfig() {
    const config = {};
    return config;
  }

  public async authorizeFileUpload(bearerToken: string) {
    const payload = CommonUtils.decodeJWTFromReq(bearerToken);
    const uuid = payload.data.uuid;
    if (!uuid) {
      throw new UnauthorizedException("uuid not found in token");
    }

    const { pos_role_id: roleId } = await this.apiPosService.fetchUserDetails(
      uuid
    );
    if (roleId !== PosRoles.SuperAdmin) {
      throw new ForbiddenException("role does not have upload access");
    }
  }

  /*
  - need to prepare event config 
   */
  public async createContest(contestBody: CreateContestDto) {
    const config = await this.getContestCreationConfig();
    const eventConfig = this.buildEventsConfig(contestBody, config);
  }

  private buildEventsConfig(contestBody: CreateContestDto, config: any) {
    const { eventVsProduct, designation } = contestBody;
    const eventConfigs = {};

    //as of now the events and eligibility are indepedent of each other - if it becomes dependent then this needs to be created with each event rule creation
    const eligibilityRules = this.generateEventEligibilityRules(contestBody);

    eventVsProduct.forEach((event) => {
      const { isSelected, value } = event;
      if (!isSelected) {
        return;
      }

      eventConfigs[value] = {};

      if (!config[value]) {
        throw new BadRequestException(
          `${value} event key is not present contest creation config`
        );
      }
      const { timeStampPath, uniqueIdentifierPath, hierarchyRules } =
        config[value];
      const rules = this.generateEventRules(event, eligibilityRules);
      eventConfigs[value] = {
        uniqueIdentifierPath,
        timeStampPath,
        hierarchyRules,
        rules,
      };
    });

    return eventConfigs;
  }

  private generateEventEligibilityRules(contestBody: CreateContestDto) {
    const { designation, participantEligbility, eligibleSalesHeads } =
      contestBody;
    const eligibilityRulesWithLogicalOperator = {
      all: [],
    };
    return {};
  }

  private generateEventRules(event: any, eligibilityRules: any) {
    const { products } = event;
    const eventRules = {
      any: [],
    };

    products.forEach((product: Record<string, any>) => {
      const { isSelected, value, label, additionalFilters } = product;
      if (!isSelected) {
        return;
      }

      const rules = [];
      const productRule = {
        name: "product",
        operator: PrimitiveOperators.EQUAL,
        value,
        path: "product",
      };
      rules.push(productRule);

      additionalFilters.forEach((additionalFilter) => {
        const { value, key, operator, label } = additionalFilter;
        if (!value || (Array.isArray(value) && !value.length)) {
          return;
        }
        const safeOperator = operator ?? PrimitiveOperators.IN;
        //need to add path in the safe operator only
        const rule = {
          name: label,
          value,
          path: key,
          operator: safeOperator,
        };
        rules.push(rule);
      });

      const eventRulesWithLogicalOperator = {
        all: rules,
      };
      eventRules.any.push(eventRulesWithLogicalOperator);
    });
  }
}
