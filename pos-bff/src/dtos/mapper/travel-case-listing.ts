import { transform } from "node-json-transform";
import CommonUtils from "../../utils/common-utils";
import { NonLmwConstants } from "../../constants/non-lmw.constants";

const actionUrlBase = "/posui/travel-insurance";
const mapper = {
  item: {
    display_message: "meta.display_message",
    pagination: "meta.pagination",
    data: "data",
  },
  operate: [
    {
      run: function (arr) {
        return transform(arr, {
          item: {
            id: "id",
            lead_id: "leadId",
            sum_insured: "productDetails.sumInsured",
            insurer_city_id: "communicationDetails.cityId",
            email: "maskedEmail",
            insured_members: "insuredMembers",
            updated_date: "updatedAt",
            first_name: "proposerDetails.firstName",
            last_name: "proposerDetails.lastName",
            salutation: "proposerDetails.salutation",
            mobile: "maskedMobile",
            action_link: "",
            logo: "selectedQuotes.insurerLogo",
            insurer_name: "selectedQuotes.insurerName",
            city_name: "communicationDetails.cityName",
            support_text: "",
            status: "status",
            sub_status: "subStatus",
            currency: "productDetails.currency",
          },
          defaults: {
            insurer_name: "",
            logo: "",
            email: "",
            full_name: "",
            sum_insured: "",
            city_name: "",
            insured_members: "",
            support_text: "",
            mobile: "",
          },
          each: function (item) {
            item.full_name = CommonUtils.buildName(
              item.salutation,
              item.first_name,
              item.last_name
            );
            const insuredMemberList = item.insured_members;
            if (insuredMemberList != null && insuredMemberList != "") {
              const insuredMembersJSON = insuredMemberList.reduce(
                (total, value) => {
                  total[value.relation] = (total[value.relation] || 0) + 1;
                  return total;
                },
                {}
              );

              let insuredMembersDetails = "";
              for (const [key, value] of Object.entries(insuredMembersJSON)) {
                insuredMembersDetails =
                  insuredMembersDetails + value + ": " + key + " + ";
              }
              insuredMembersDetails = insuredMembersDetails.slice(0, -3);
              item.insured_members = insuredMembersDetails;
            }
            if (
              item.status === NonLmwConstants.status.LEAD_GENERATED ||
              item.status === NonLmwConstants.status.QUOTE_GENERATED
            ) {
              item.action_link = `${actionUrlBase}/quotes?request=${item.lead_id}`;
            }
            if (item.status === NonLmwConstants.status.QUOTE_SELECTED) {
              item.action_link = `${actionUrlBase}/checkout?request=${item.lead_id}`;
            }
            if (item.status === NonLmwConstants.status.PROPOSAL) {
              item.action_link = `${actionUrlBase}/checkout?request=${item.lead_id}`;
            }
            if (item.status === NonLmwConstants.status.PAYMENT) {
              item.action_link = `${actionUrlBase}/confirm?request=${item.lead_id}`;
            }
            if (
              item.sub_status ===
                NonLmwConstants.subStatus.PAYMENT_LINK_GENERATED ||
              item.sub_status === NonLmwConstants.subStatus.PAYMENT_PENDING
            ) {
              item.action_link = `${actionUrlBase}/confirm?request=${item.lead_id}`;
            }
            if (
              item.status === NonLmwConstants.status.BOOKED ||
              item.status === NonLmwConstants.subStatus.PAYMENT_SUCCESS
            ) {
              item.action_link = `${actionUrlBase}/payment-status?request=${item.lead_id}`;
            }

            if (item.currency === "euro" || item.currency === "Euro") {
              item.currency = "€";
            } else {
              item.currency = "$";
            }
            return item;
          },
        });
      },
      on: "data",
    },
  ],
};
export { mapper };
