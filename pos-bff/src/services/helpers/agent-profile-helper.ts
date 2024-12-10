import { CaseListingProduct } from "../../constants/case-listing.constants";
import _ from "lodash";
import { PHOTO_SLUG } from "../../constants/agent-profile.constants";
import { Injectable } from "@nestjs/common";

@Injectable()
export default class AgentProfileHelper {
  public agentDetailsResponseMapper(agentDetails: any) {
    const response = agentDetails;
    delete response.joiningDate;
    delete response.uuid;
    delete response.channelParnterId;
    return response;
  }

  public addProducts(agentDetails: any, eligibleForLife: boolean) {
    let products = CaseListingProduct.general;
    if (eligibleForLife) {
      products = [...products, ...CaseListingProduct.nonGeneral];
    }
    agentDetails.products = products;
    return agentDetails;
  }

  public transformAgentDetails(agentDetails: any) {
    const basicDetails = this.basicAgentDetailsBuilder(agentDetails);
    const documents = this.agentDocumentBuilder(agentDetails);
    return { ...basicDetails, ...documents };
  }

  public basicAgentDetailsBuilder = function (user: any) {
    const details: any = {};
    user = user[0];

    if (!!user.state_name) {
      details.stateName = user.state_name;
    }
    if (!!user.city_name) {
      details.cityName = user.city_name;
    }
    if (!!user.first_name) {
      details.name = user.first_name + (user.last_name ||= "");
    }
    if (!!user.uuid) {
      details.uuid = user.uuid;
    }
    if (!!user.eligible_for_life) {
      details.eligibleForLife = user.eligible_for_life;
    }
    if (!!user.channel_partner_id) {
      details.channelParnterId = user.channel_partner_id;
    }
    return details;
  };

  public agentDocumentBuilder = function (user) {
    const documents: any = {};

    const documentsToBeShown = [PHOTO_SLUG];
    user
      .filter(({ document_type }) => documentsToBeShown.includes(document_type))
      .forEach(({ document_type, file_path }) => {
        const documentName = _.camelCase(document_type);
        documents[documentName] = file_path;
      });
    return documents;
  };

  public agentPropertiesBuilder = function (user: any) {
    const properties: any = {};
    const userProperties = user?.properties ?? {};

    properties.cityName = user?.cityName;
    properties.stateName = user?.stateName;
    properties.name = user?.name;
    properties.eligibleForLife = user?.onboarded_on_life;

    if (userProperties.years_of_insurance_experience) {
      properties["yearsOfExperience"] =
        userProperties.years_of_insurance_experience;
    }
    if (userProperties?.languages?.length) {
      properties["languages"] = userProperties?.languages.join(", ");
    }
    if (userProperties?.number_of_policies_sold) {
      properties["policyCount"] = userProperties.number_of_policies_sold;
    }
    if (user?.data?.is_fusion_agent) {
      if (userProperties.yoe) {
        properties["yearsOfExperience"] = userProperties.yoe;
      }
      if (userProperties.spoken_languages) {
        properties["languages"] = userProperties.spoken_languages.join(", ");
      }
      if (userProperties.policy_count) {
        properties["policyCount"] = userProperties.policy_count;
      }
    }
    return properties;
  };
}
