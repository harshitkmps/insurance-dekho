import { Logger, HttpException, HttpStatus } from "@nestjs/common";
import {
  LifeOfflineCreateRequestInterface,
  TicketDetails,
  MedicalDetails,
  InsuredDetails,
  ProposerDetails,
  CustomerDetails,
  PremiumDetails,
  PlanDetail,
  DocDetails,
} from "../../interfaces/life-offline/create-request-interface";
import {
  LIFE_OFFLINE_STATUS,
  LIFE_OFFLINE_SUB_STATUS,
} from "@/src/constants/itms.constants";

export function buildCreateLifeOfflineRequest(
  reqBody: any,
  userDetails: any,
  tenantInfo: any,
  userInfo: any
) {
  const request: LifeOfflineCreateRequestInterface = {
    ticketDetails: buildTicketDetails(
      reqBody,
      userDetails,
      tenantInfo,
      userInfo
    ),
    medicalDetails: buildMedicalDetails(reqBody),
    insuredDetails: buildInsuredDetails(reqBody),
    proposerDetails: buildProposerDetails(reqBody),
    customerDetails: buildCustomerDetails(reqBody),
    premiumDetails: buildPremiumDetails(reqBody),
    planDetails: buildPlanDetails(reqBody),
    docDetails: buildDocDetails(reqBody),
  };
  return request;
}

export function buildTicketDetails(reqBody, userDetails, tenantInfo, userInfo) {
  try {
    const request: TicketDetails = {
      dealerId: userDetails.dealer_id,
      dealerCityId: userDetails.dealer_city_id,
      status: LIFE_OFFLINE_STATUS[reqBody?.status],
      subStatus: LIFE_OFFLINE_SUB_STATUS[reqBody?.subStatus],
      policyType: reqBody?.policyType,
      ticketUuid: reqBody?.ticketUuid,
      insurerId: reqBody?.insurerId,
      insurerName: reqBody?.insurerName,
      quotes: reqBody?.quotes,
      videoStatus: reqBody?.videoStatus,
      source: tenantInfo.source,
      subSource: tenantInfo.subSource,
      proposalNumber: reqBody?.proposalNumber,
      productType: reqBody.productType,
    };

    if (userInfo) {
      request.dealerId =
        userInfo?.[0]?.dealer_id || parseInt(reqBody?.dealerId);
      request.dealerCityId =
        userInfo?.[0]?.dealer_city_id || parseInt(reqBody?.dealerCityId);
    }

    return request;
  } catch (error) {
    Logger.error("Error building ticket details:", error);
    throw new HttpException(
      `Error building ticket details`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export function buildMedicalDetails(reqBody) {
  try {
    const request: MedicalDetails = {
      isSmoker: reqBody?.isSmoker,
      diseaseStatus: reqBody?.diseaseStatus,
      diseaseComment: reqBody?.diseaseComment,
      covidStatus: reqBody?.covidStatus,
      covidComment: reqBody?.covidStatus ? "infected" : "",
      dateOfRecovery: reqBody?.dateOfRecovery,
    };
    return request;
  } catch (error) {
    Logger.error("Error building medical details:", error);
    throw new HttpException(
      `Error building medical details`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export function buildCustomerDetails(reqBody) {
  try {
    const request: CustomerDetails = {
      customerName: reqBody.name,
      gender: reqBody.gender,
      mobile: reqBody.mobile,
      altMobile: reqBody?.altMobile,
      dob: reqBody.dob,
      panNumber: reqBody.pan,
      email: reqBody.email,
      address: reqBody.address,
      nationality: reqBody.nationality,
      annualIncome: reqBody.income,
      annualIncomeDisplayName: reqBody?.incomeLabel,
      occupation: reqBody.occupation,
      comments: reqBody.comment,
      qualification: reqBody.qualification,
      height: reqBody.height,
      weight: reqBody.weight,
      preExistingPolicy: reqBody.prePolicyDetails,
      preExistingSumAssured: reqBody?.activePolicySumAssured,
      state: reqBody?.state,
      cityId: reqBody?.cityId,
      stateId: reqBody?.stateId,
      city: reqBody?.city,
      pinCode: reqBody?.pincode,
    };

    return request;
  } catch (error) {
    Logger.error("Error building customer details:", error);
    throw new HttpException(
      `Error building customer details`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export function buildPremiumDetails(reqBody) {
  try {
    const request: PremiumDetails = {
      premium: reqBody.premium,
      paymentFrequency: reqBody.premiumFrequency,
      paymentTerm: reqBody.paymentTerm,
      gstWaiver: reqBody.gstWaiver,
      paymentMode: reqBody?.paymentMode,
    };

    return request;
  } catch (error) {
    Logger.error("Error building premium details:", error);
    throw new HttpException(
      `Error building premium details`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export function buildPlanDetails(reqBody) {
  try {
    const request: PlanDetail[] = [
      {
        planName: reqBody.planName,
        planId: reqBody.planId,
        planSlug: reqBody?.planSlug,
        subPlan: reqBody?.subPlan,
        productTypeSlug: reqBody?.productTypeSlug,
        subPlanType: reqBody?.subPlanType,
        productType: reqBody?.productType,
        coverage: reqBody.sumAssured,
        policyTerm: reqBody.policyTerm,
        sumAssured: reqBody.sumAssured,
        insurerId: reqBody?.insurerId,
        insurerName: reqBody?.insurerName,
        insurerSlug: reqBody?.insurerSlug,
        planType: reqBody?.planType,
        premiumPaymentOption: reqBody?.ppo,
        premiumPaymentOptionSlug: reqBody?.premiumPaymentOptionSlug,
      },
    ];

    return request;
  } catch (error) {
    Logger.error("Error building plan details:", error);
    throw new HttpException(
      `Error building plan details`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export function buildDocDetails(reqBody) {
  try {
    const request: DocDetails[] = reqBody?.docDetails;
    return request;
  } catch (error) {
    Logger.error("Error building doc details:", error);
    throw new HttpException(
      `Error building doc details`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export function buildInsuredDetails(reqBody) {
  try {
    const request: InsuredDetails[] = [
      {
        name: reqBody.name,
        dob: reqBody.dob,
        gender: reqBody.gender,
        pan: reqBody.pan,
        mobile: reqBody.mobile,
        altMobile: reqBody?.altMobile,
        email: reqBody.email,
        education: reqBody.qualification,
        occupation: reqBody.occupation,
        relationship: reqBody.insuredPerson,
        annualIncome: reqBody.income,
        maritalStatus: reqBody.meritalStatus,
        residentialStatus: reqBody.residentialStatus,
        country: reqBody.residentialCountry,
        heightFt: reqBody.heightFt,
        heightIn: reqBody.heightIn,
        address: reqBody.address,
        pincode: reqBody.pincode,
        area: reqBody.area,
        preExistingPolicy: reqBody.prePolicyDetails,
        preexistingSumAssured: reqBody?.activePolicySumAssured,
        weight: reqBody.weight,
        state: reqBody?.state,
        cityId: reqBody?.cityId,
        stateId: reqBody?.stateId,
        city: reqBody?.city,
      },
    ];

    return request;
  } catch (error) {
    Logger.error("Error building insured person details:", error);
    throw new HttpException(
      `Error building insured person details`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export function buildProposerDetails(reqBody) {
  try {
    const request: ProposerDetails = {
      name: reqBody.proposerName,
      dob: reqBody.proposerDob,
      gender: reqBody.proposerGender,
      mobile: reqBody.proposerMobile,
      altMobile: reqBody?.proposerAltMobile,
      email: reqBody.proposerEmail,
      education: reqBody.proposerQualification,
      occupation: reqBody.proposerOccupation,
      relationship: reqBody.proposerRelation,
      annualIncome: reqBody.proposerIncome,
      maritalStatus: reqBody.proposerMeritalStatus,
      residentialStatus: reqBody.proposerResidentialStatus,
      country: reqBody.proposerCountry,
      address: reqBody.proposerAddress,
      pincode: reqBody.proposerPincode,
      area: reqBody.proposerArea,
      state: reqBody?.proposerState,
      cityId: reqBody?.proposerCityId,
      stateId: reqBody?.proposerStateId,
      city: reqBody?.proposerCity,
      ecsOpted: reqBody?.proposerEcs,
      isSmoke: reqBody?.proposerIsSmoke,
      pan: reqBody?.proposerPan,
    };

    return request;
  } catch (error) {
    Logger.error("Error building proposer person details:", error);
    throw new HttpException(
      `Error building proposer person details`,
      HttpStatus.BAD_REQUEST
    );
  }
}
