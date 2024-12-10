import { CASE_TYPE_MAP } from "../../constants/itms.constants";
import {
  Common,
  Customer,
  ItmsCreateRequestInterface,
  MoreDetails,
  PolicyDetails,
  Ticket,
  Vehicle,
} from "../../interfaces/offline/itms-create-request.interface";
import ContextHelper from "../../services/helpers/context-helper";

const fuelType = {
  Diesel: "Diesel",
  Electric: "Electric",
  ExternalCNG: "CNG",
  CNG_LPG: "CNG",
  Petrol: "Petrol",
  CNG: "CNG",
  LPG: "LPG",
};

export async function buildCustomerDetails(
  reqBody: any,
  userDetails: any,
  userInfo: any
): Promise<Customer> {
  const body = {
    dealer_id: userInfo?.dealer_id,
    ref_dealer_id: userInfo?.ref_dealer_id ?? 0,
    business_unit_id: 2,
  };

  if (userDetails) {
    body.dealer_id =
      userDetails?.[0]?.dealer_id || parseInt(reqBody.vehicleDetails?.dealerId);
    body.ref_dealer_id = userDetails?.[0]?.referrer_id ?? 0;
  }

  return body;
}

export async function buildVehicleDetails(reqBody: any): Promise<Vehicle> {
  const vehicleDetails = reqBody.vehicleDetails;
  const variant = vehicleDetails?.variant;

  const checkDLRegNoFormat = (regNo: string) => {
    if (
      regNo &&
      regNo.substring(0, 2).toUpperCase() === "DL" &&
      (regNo.substring(3, 1).toUpperCase() === "C" ||
        regNo.substring(3, 1).toUpperCase() === "S") &&
      regNo.substring(2, 1) <= "9"
    ) {
      return `DL0${regNo.substring(2)}`;
    }
    return regNo;
  };

  const vehicle = {
    vehicle_type: vehicleDetails?.type,
    vehicleSubType: vehicleDetails?.subType
      ? parseInt(vehicleDetails.subType)
      : 0,
    vehicleSubUsageType: vehicleDetails?.usageType ?? "",
    permitUsageTypes: vehicleDetails?.type === "9" ? "2" : "",
    registration_no:
      parseInt(vehicleDetails?.caseType) === CASE_TYPE_MAP.NEW
        ? vehicleDetails?.rtoCode
        : checkDLRegNoFormat(vehicleDetails?.regNumber),
    rto: vehicleDetails?.rtoCode,
    registration_date: vehicleDetails?.registrationDate,
    manufacturing_date: vehicleDetails?.manufacturingDate,
    fuel_type: variant?.fuel ?? fuelType[vehicleDetails?.fuelType],
    make_id: variant?.make_id,
    model_id: variant?.parent_id || variant?.model_id,
    variant_id: variant?.version_id,
    seating_capacity: variant?.seats || vehicleDetails?.seats,
    grossWeight: variant?.gross_vehicle_weight ?? null,
    makeModelName: `${variant?.make} ${variant?.model} ${variant?.version}`,
    engineNo: vehicleDetails?.engineNumber,
    chassisNo: vehicleDetails?.chassisNumber,
    gibpl_insurer_id: vehicleDetails?.insurerId
      ? parseInt(vehicleDetails.insurerId)
      : "",
  };

  if (
    variant?.fuel &&
    ["CNG", "LPG", "CNG_LPG", "ExternalCNG"].includes(variant.fuel)
  ) {
    vehicle.fuel_type = fuelType[variant.fuel];
  }

  if (vehicleDetails?.makeModelVariant) {
    vehicle.makeModelName = vehicleDetails.makeModelVariant;
  }

  if (vehicleDetails.type === "9" && variant?.sub_category_id) {
    vehicle.vehicleSubType = variant.sub_category_id;
  }

  return vehicle;
}

export async function buildTicketDetails(
  reqBody: any,
  userInfo: any
): Promise<Ticket> {
  return {
    uuid: userInfo?.uuid,
    ticketUuid: reqBody.ticketUuid ?? "",
  };
}

export async function buildOfflineDetail(
  reqBody: any,
  tenantInfo: any,
  userInfo: any
): Promise<PolicyDetails> {
  const context = ContextHelper.getStore();
  const policyInfo = {
    caseType:
      parseInt(reqBody.vehicleDetails?.caseType) ===
      CASE_TYPE_MAP.BREAKIN_GREATER_THAN_90_DAYS
        ? CASE_TYPE_MAP.ROLLOVER_BREAKIN
        : parseInt(reqBody.vehicleDetails?.caseType),
    quoteRequestType: reqBody?.vehicleDetails?.offlineType,
    policyType: parseInt(reqBody?.vehicleDetails?.policyType),
    medium: context.get("medium"),
    mode: "OFFLINE",
    requestType: "OFFLINE",
    source: tenantInfo.source,
    subSource: tenantInfo.subSource,
    sourceCreatorId: userInfo?.user_id,
    within90Days:
      parseInt(reqBody.vehicleDetails?.caseType) ===
      CASE_TYPE_MAP.BREAKIN_GREATER_THAN_90_DAYS
        ? 0
        : 1,
    caseReasonId: reqBody.previousPolicyDetails?.reason,
    caseAdditionalReason: reqBody.previousPolicyDetails?.offlineOtherReason,
    cngLpgKit: 0,
    kitType: null,
    cngLpgValue: 0,
    odTenure: "",
  };

  if (["CNG", "LPG", "CNG_LPG"].includes(reqBody.vehicleDetails?.fuelType)) {
    policyInfo.cngLpgKit = 1;
    policyInfo.kitType = 0;
  } else if (reqBody.vehicleDetails?.fuelType === "ExternalCNG") {
    policyInfo.cngLpgKit = 1;
    policyInfo.kitType = 1;
    policyInfo.cngLpgValue = reqBody.vehicleDetails?.cngKitCost
      ? parseInt(reqBody.vehicleDetails.cngKitCost)
      : 0;
  }

  return policyInfo;
}

export async function buildCommonParameters(
  reqBody: any,
  tenantInfo: any
): Promise<Common> {
  const context = ContextHelper?.getStore();
  return {
    medium: context.get("medium"),
    mode: "OFFLINE",
    requestType: reqBody.vehicleDetails?.offlineType,
    source: tenantInfo.source,
    subSource: tenantInfo.subSource,
  };
}

export async function buildMoreDetail(reqBody: any): Promise<MoreDetails> {
  const preferredInsurers = [];
  let isAddOnSelected = 0;
  const isCvRevamp = parseInt(reqBody.vehicleDetails?.type) === 9;
  for (const preferredInsurer of reqBody.previousPolicyDetails
    ?.preferredInsurers) {
    if (preferredInsurer.addOns?.length) {
      isAddOnSelected = 1;
    }
    preferredInsurers.push({
      insurers: !isCvRevamp
        ? preferredInsurer.insurer.map((insurer: any) => insurer.label)
        : [reqBody.vehicleDetails?.insurerName],
      idv: preferredInsurer.preferredIdv,
      addons: preferredInsurer.addOns?.length
        ? preferredInsurer.addOns.map((addOn: any) => addOn.label)
        : [],
    });
  }
  const caseType = parseInt(reqBody.vehicleDetails?.caseType);

  return {
    addOns: isAddOnSelected,
    claimTaken: reqBody.previousPolicyDetails?.claimTaken,
    prePolicyEnddate: null,
    prePolicyInsurerId:
      caseType !== CASE_TYPE_MAP.NEW && caseType !== CASE_TYPE_MAP.USED
        ? reqBody.previousPolicyDetails?.previousInsurer
        : "",
    preferred:
      reqBody.vehicleDetails?.offlineType === "QUOTEREQUEST"
        ? preferredInsurers
        : [],
    previousNcb: 1,
    previousNcbPercentage: 0,
    remarks: reqBody.previousPolicyDetails?.remarks,
  };
}

export const buildProposalDetail = async (vahaanDetails: any): Promise<any> => {
  if (!vahaanDetails) {
    return {};
  }
  const proposal = {
    full_name: vahaanDetails.owner_name,
    mobile_no: vahaanDetails.owner_mobile_number,
    address: vahaanDetails.owner_permanent_address,
    pincode: !isNaN(Number(vahaanDetails?.owner_permanent_address_pincode))
      ? Number(vahaanDetails.owner_permanent_address_pincode)
      : null,
  };
  return proposal;
};

export const buildCreateOfflineRequest = async (
  reqBody: any,
  userDetails: any,
  tenantInfo: any,
  userInfo: any
) => {
  const request: ItmsCreateRequestInterface = {
    customer: await buildCustomerDetails(reqBody, userDetails, userInfo),
    vehicle: await buildVehicleDetails(reqBody),
    ticket: await buildTicketDetails(reqBody, userInfo),
    commonParameters: await buildCommonParameters(reqBody, tenantInfo),
    insofflineQotes: await buildOfflineDetail(reqBody, tenantInfo, userInfo),
    moreDetail: await buildMoreDetail(reqBody),
    offlineQuoteType:
      reqBody.vehicleDetails?.offlineType === "QUOTEREQUEST" ? "1" : "2",
    vahaanResponse: reqBody.vahaanDetails,
    proposalDetails: await buildProposalDetail(reqBody.vahaanDetails),
  };
  return request;
};
