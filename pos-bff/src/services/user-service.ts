import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import LsqService from "./lsq-service";
import EncryptionService from "./encryption-service";
import ApiPosService from "./apipos-service";
import CpsService from "../services/cps-service";
import DealerService from "../services/dealer-service";
import ConfigService from "./config-service";
import IamService from "./iam-service";
import ManageLeadService from "./manage-lead-service";
import {
  SearchUserRequestDto,
  SoftDeleteUserDto,
  UpdateUserBasicDetailsDto,
  UpdateUserBody,
} from "../dtos/request/user-request.dto";
import { USER_STATUS } from "../constants/agent-profile.constants";
import LOSService from "./los-service";
import MasterAPIService from "./master-service";
import moment from "moment";
import { USER_REASON_FOR_DEACTIVATION_MAPPING } from "../constants/config.constants";
import ItmsService from "../core/api-helpers/itms-service";
import CaseListingService from "./case-listing-v2-service";
import { find, flatten, isEmpty, omit } from "lodash";
import { PosRoles } from "../constants/pos-roles.constants";
import { USER_DOC_LABEL_SLUG_MAP } from "../constants/user.constants";
import UtilityService from "./utility-service";
import { UtilityConfigs } from "../constants/utility-config.constants";

@Injectable()
export default class UserService {
  constructor(
    private apiPosService: ApiPosService,
    private lsqService: LsqService,
    private encryptionService: EncryptionService,
    private cpsService: CpsService,
    private dealerService: DealerService,
    private configService: ConfigService,
    private iamService: IamService,
    private leadService: ManageLeadService,
    private losService: LOSService,
    private masterApiService: MasterAPIService,
    private itmsService: ItmsService,
    private caseListingService: CaseListingService,
    private utilityService: UtilityService
  ) {}

  public async isRegistered(searchParams: any): Promise<any> {
    try {
      const encryptionKey = Object.keys(searchParams)[0];
      const encryptionRequest = searchParams[encryptionKey];

      const encryptedData = await this.encryptionService.encrypt([
        encryptionRequest.toString(),
      ]);
      const modifiedUserMobileOrEmail = {
        [encryptionKey]: encryptedData[0].ecrypted,
      };
      const isUserExistInCps = await this.dealerService.getDealersV2(
        modifiedUserMobileOrEmail
      );
      Logger.debug("isUserExistInCps ", {
        isUserExistInCps: isUserExistInCps,
      });
      if (isUserExistInCps.data?.length > 0) {
        return true;
      }

      const isUserExistInSfa = await this.lsqService.getSalesPartnerDetails(
        modifiedUserMobileOrEmail
      );
      Logger.debug("isUserExistInSfa ", {
        isUserExistInSfa: isUserExistInSfa,
      });
      if (isUserExistInSfa?.data?.length > 0) {
        return true;
      }
      let uuid;
      if (searchParams.mobile) {
        uuid = await this.iamService.getIamUserUuid(searchParams.mobile);
      } else if (searchParams.email) {
        uuid = await this.iamService.getDetailsByEmail({
          email: searchParams.email,
        });
      }

      const searchedUser = await this.apiPosService.searchUser({
        uuid,
        projections: "uuid,first_name,is_active",
      });
      if (
        searchedUser &&
        searchedUser?.is_active.toString() === USER_STATUS.ACTIVE
      ) {
        return true;
      }
      return false;
    } catch (error) {
      Logger.error("error while searching user in cps or sfa", { error });
      return true;
    }
  }

  public async updateUserDetails(body: any): Promise<any> {
    const { mobile, email } = body;
    let userMobileOrEmail: UpdateUserBody = {};
    if (email) {
      userMobileOrEmail = { email };
    } else if (mobile) {
      userMobileOrEmail = { mobile };
    }
    const cpsSfaTblResponse = await this.isRegistered(userMobileOrEmail);
    if (cpsSfaTblResponse) {
      throw new HttpException(
        "User already exists in system",
        HttpStatus.BAD_REQUEST
      );
    }
    const userIamUuid = userMobileOrEmail?.email
      ? await this.iamService.getDetailsByEmail(userMobileOrEmail)
      : await this.iamService.getIamUserUuid(userMobileOrEmail.mobile);
    if (userIamUuid) {
      const userIamData = await this.iamService.getDetailsByUuid(
        userIamUuid,
        {}
      );
      const leadSearchResp = await this.leadService.leadSearchByMobileAndEmail({
        ...userMobileOrEmail,
      });
      const leadSearchContactInfo =
        leadSearchResp?.email?.length > 0
          ? leadSearchResp.email
          : leadSearchResp?.mobile?.length > 0
          ? leadSearchResp.mobile
          : null;
      if (leadSearchContactInfo?.length > 0) {
        const isRegisteredLead = leadSearchContactInfo.some(
          (contactInfo) => contactInfo.leadState === "registered"
        );
        if (isRegisteredLead) {
          throw new HttpException(
            "User already exists in system",
            HttpStatus.BAD_REQUEST
          );
        }
      }
      const iamSoftDelresponse = await this.iamService.iamSoftDelete(
        userIamUuid,
        { ...userIamData, tenantId: userIamData.tenant_id }
      );
      if (iamSoftDelresponse.statusCode !== 200) {
        throw new HttpException(
          "Error while updating user",
          HttpStatus.BAD_REQUEST
        );
      }
    }
    const updatedUserDetails = {
      ...body,
      ...(body?.email && { mobile: body?.currentUserMobile }),
      ...(body?.mobile && { email: body?.currentUserEmail }),
    };
    const response = await this.iamService.updateIamUserDetails(
      updatedUserDetails
    );
    Logger.debug("User updated in IAM response", response);
    if (response.response_http_code !== "200") {
      throw new HttpException(
        "Error while updating user",
        HttpStatus.BAD_REQUEST
      );
    }
    const cpsPosData = await this.prepareCpsPosdata(updatedUserDetails);
    const updateUserInCpsPosResponse =
      await this.apiPosService.updateUserDetails(body.uuid, cpsPosData);
    Logger.debug(
      "User updated in Cps and Tbluser response",
      updateUserInCpsPosResponse
    );
    return updateUserInCpsPosResponse;
  }

  public async updateUser(uuid: string, body): Promise<any> {
    const updateBody: any = {};
    const { address, pincode } = body;
    if (address) {
      updateBody.work_address = address;
    }
    if (pincode) {
      const areaDetailsByPinCode =
        await this.masterApiService.getAreaDetailsByPinCode(pincode);
      updateBody.work_city_id = areaDetailsByPinCode[0].cityId;
      updateBody.work_pincode = pincode;
    }
    const cpsResponse = await this.apiPosService.updateUserDetails(
      uuid,
      updateBody
    );
    Logger.debug("User updated in Cps response", cpsResponse);
    return cpsResponse;
  }

  public async updateUserBankDetails(userDetails: any): Promise<any> {
    const verifyBankPayload = {
      beneficiaryAccountNumber: userDetails?.accountNumber,
      beneficiaryIFSC: userDetails?.ifsc,
      beneficiaryName: userDetails?.beneficiaryName,
      beneficiaryMobile: userDetails?.beneficiaryMobile,
      beneficiaryEmail: userDetails?.beneficiaryEmail,
      beneficiaryAddress: userDetails?.beneficiaryAddress,
      uuid: userDetails?.uuid,
    };
    const verifyBankResponse = await this.losService.verifyBankDetails(
      verifyBankPayload
    );
    if (
      verifyBankResponse?.nameMatch === "yes" &&
      verifyBankResponse?.bankVerified === true
    ) {
      const updateUserBankDetails = {
        beneficiary_name: verifyBankResponse?.beneNameAtBank,
        ifsc_code: userDetails?.ifsc,
        account_number: userDetails?.accountNumber,
        uuid: userDetails?.uuid,
        bank_name: userDetails?.bankName,
      };
      const responseData: any = await this.apiPosService.updateAgentBankDetails(
        updateUserBankDetails
      );
      return responseData;
    }
    let errorMsg = verifyBankResponse?.message;
    if (
      verifyBankResponse?.nameMatch === "no" &&
      verifyBankResponse?.bankVerified
    ) {
      errorMsg = "Partner's name doesn't match with beneficiary's name";
    }
    throw new HttpException(
      errorMsg || "Error while verifying Bank account details from Bank",
      HttpStatus.BAD_REQUEST
    );
  }

  public async softDeleteUser(payload: SoftDeleteUserDto): Promise<any> {
    Logger.debug("userDetails ", { userDetails: payload });
    const iamUuid = payload.uuid;
    const mobile = payload.mobile;
    const channelPartnerId = payload.channelPartnerId;
    await this.iamService.iamSoftDelete(iamUuid, {
      mobile: payload.mobile,
      tenantId: payload.tenantId,
    });
    if (channelPartnerId) {
      await this.cpsService.cpsSoftDelete(channelPartnerId);
    }
    await this.itmsService.itmsSoftDelete(mobile);
  }

  private prepareUpdateChannelPartnerPayload(
    userDetails: UpdateUserBasicDetailsDto,
    existingUserDetail: any
  ): object {
    const partnerConfigUpsertArray = [];
    const updateChannelPartnerPayload: any = {
      isUuidPresent: true,
    };
    if (userDetails.hasOwnProperty("isActive")) {
      updateChannelPartnerPayload.is_active = userDetails.isActive ? "1" : "0";
    }
    if (userDetails.hasOwnProperty("irdaId")) {
      updateChannelPartnerPayload.irda_id = userDetails.irdaId;
    }
    if (userDetails.hasOwnProperty("irdaReportingDate")) {
      updateChannelPartnerPayload.irda_reporting_date =
        userDetails.irdaReportingDate;
    }
    if (userDetails.hasOwnProperty("reasonForInactivation")) {
      updateChannelPartnerPayload.reason_of_inactivation =
        userDetails.reasonForInactivation;
      updateChannelPartnerPayload.date_of_inactivation = moment().format(
        "YYYY-MM-DD hh:mm:ss"
      );
    }
    if (userDetails.hasOwnProperty("convertRAPToMaster")) {
      updateChannelPartnerPayload.convertToMaster =
        userDetails.convertRAPToMaster;
    }
    if (
      userDetails?.hasOwnProperty("isRedemptionAllowed") &&
      (existingUserDetail?.status === "1" || userDetails?.isActive)
    ) {
      partnerConfigUpsertArray.push({
        key: "isRedemptionAllowed",
        value: Number(userDetails.isRedemptionAllowed),
      });
    }
    if (
      userDetails?.hasOwnProperty("isRedemptionAllowed") &&
      userDetails?.reasonForRedemptionDisable &&
      (existingUserDetail?.status === "1" || userDetails?.isActive)
    ) {
      partnerConfigUpsertArray.push({
        key: "reasonForRedemptionDisable",
        value: userDetails.reasonForRedemptionDisable,
      });
    }

    if (partnerConfigUpsertArray.length) {
      updateChannelPartnerPayload.partnerConfigArray = partnerConfigUpsertArray;
    }
    return updateChannelPartnerPayload;
  }

  public async updateUserBasicDetails(
    userDetails: UpdateUserBasicDetailsDto
  ): Promise<any> {
    if (
      userDetails.hasOwnProperty("isRedemptionAllowed") &&
      !userDetails.isRedemptionAllowed &&
      !userDetails.reasonForRedemptionDisable
    ) {
      throw new BadRequestException(
        "reason for redemption is required while disable."
      );
    }
    const existingUserDetail: any = await this.apiPosService.fetchUserDetails(
      userDetails.uuid,
      false
    );
    if (!existingUserDetail) {
      throw new BadRequestException(`user details not found for given uuid`);
    }
    const payload: any = this.prepareUpdateChannelPartnerPayload(
      userDetails,
      existingUserDetail
    );
    const response = await this.apiPosService.updateUserDetails(
      userDetails.uuid,
      payload,
      {
        status: "status",
        message: "data.errors.[0].message",
      }
    );
    if (!response) {
      throw new BadRequestException(`error in updating user details`);
    }
    if (
      userDetails.isActive === false &&
      userDetails.reasonForInactivation ==
        USER_REASON_FOR_DEACTIVATION_MAPPING.NOC_GIVEN.STATUS
    ) {
      await this.softDeleteUser({
        uuid: userDetails.uuid,
        channelPartnerId: existingUserDetail.cps_id,
        mobile: existingUserDetail.mobile,
        tenantId: existingUserDetail.tenant_id,
      });
      await this.losService.triggerEvent({
        leadId: userDetails.uuid,
        leadTrigger: "NOC_GIVEN",
      });
    }
  }

  public async fetchUserDetails(uuid: any) {
    let userDetails = await this.apiPosService.fetchUserDetails(uuid, false);
    if (!userDetails) {
      throw new HttpException(
        `user details not found with given uuid`,
        HttpStatus.BAD_REQUEST
      );
    }
    const decryptedPIFields = ["email", "mobile", "pan"];
    userDetails = omit(userDetails, decryptedPIFields);
    userDetails.isUserEditAllowed = this.isUserEditAllowed(
      userDetails.pos_role_id
    );
    userDetails.isRedemptionAllowed =
      userDetails?.config?.isRedemptionAllowed?.value === undefined ||
      userDetails?.config?.isRedemptionAllowed?.value === "1";
    userDetails.isActive = userDetails.status === "1";
    userDetails.canToggleStatus = true;
    if (!userDetails.isActive) {
      const reason = Object.values(USER_REASON_FOR_DEACTIVATION_MAPPING).find(
        (value) => value.STATUS === userDetails.deactivation_reason
      );
      userDetails.deactivation_reason = reason?.DISPLAY_MESSAGE ?? "N/A";
      userDetails.canToggleStatus = reason?.IS_UI_ACTIVATION_ALLOWED ?? true;
    }
    const reasonListConfig = await this.utilityService.getConfig(
      UtilityConfigs.REASONSLIST
    );
    userDetails.atcRedemptionDeactivationReasonList =
      reasonListConfig?.configValue?.atcRedemptionDeactivationReasonList;

    userDetails.userDeactivationReasonList = Object.values(
      USER_REASON_FOR_DEACTIVATION_MAPPING
    )
      .filter((value) => value.SHOW_IN_DROPDOWN)
      .map((value) => ({
        value: value.STATUS,
        label: value.DISPLAY_MESSAGE,
      }));
    return userDetails;
  }

  public isUserEditAllowed(roleId) {
    return roleId === PosRoles.Agent;
  }

  private async formatUserInfoResponse(users: any[]): Promise<any[]> {
    const [allRoles, allBusinessUnits] = await Promise.all([
      this.caseListingService.getPosRoles(),
      this.configService.fetchBusinessUnits(),
      this.apiPosService.getUserDocuments({ uuid: users[0].uuid }),
    ]);
    const formattedUsers = users.map((user) => {
      const roleName = find(allRoles, { id: user.pos_role_id })?.name;
      const formattedUser = {
        uuid: user.uuid,
        firstName: user.first_name,
        roleId: user.pos_role_id,
        roleName: roleName,
        businessUnit:
          user.businessUnitName || user.channel_partner_type || "NA",
        gcdCode: user.gcd_code,
        added: user.added,
        isActive: user.status == "1" ? 1 : 0,
        isUserEditAllowed: this.isUserEditAllowed(user.pos_role_id),
      };
      if (user?.business_unit_id) {
        user.businessUnit = find(allBusinessUnits, {
          id: user.business_unit_id,
        })?.name;
        delete user.business_unit_id;
      }
      return formattedUser;
    });
    return formattedUsers;
  }

  private async formatCPSResponse(users: any[]): Promise<any[]> {
    const allRoles = await this.caseListingService.getPosRoles();
    const formattedUsers = users.map((user: any) => {
      if (!user || isEmpty(user)) {
        return {};
      }
      return {
        uuid: user.iam_uuid,
        firstName: user.name,
        roleId: PosRoles.Agent,
        roleName: find(allRoles, { id: PosRoles.Agent })?.name,
        businessUnit: user.channel_partner_type,
        gcdCode: user.gcd_code,
        added: user.created,
        isActive: user.status ? 1 : 0,
        isUserEditAllowed: this.isUserEditAllowed(PosRoles.Agent),
      };
    });
    return flatten(formattedUsers);
  }

  public async searchUser(payload: SearchUserRequestDto): Promise<any> {
    // all parameters are optional
    // at least one parameter is required
    // priority mobile >> email >> gcdCode
    if (payload.mobile || payload.email) {
      const user = await this.apiPosService.fetchUserDetails(
        null,
        false,
        payload.mobile,
        payload.email
      );
      if (!user) {
        throw new BadRequestException(
          `user not found with given mobile / email`
        );
      }
      const userDocs = await this.getUserDocuments(user.uuid);
      const formattedUsers = await this.formatUserInfoResponse([user]);
      formattedUsers[0].documents = userDocs;
      return formattedUsers;
    }
    if (payload.gcdCode || payload.pan) {
      let users: any;
      if (payload.gcdCode) {
        users = await this.dealerService.getDealersV2({
          gcd_code: payload.gcdCode,
        });
        if (!users?.data?.length) {
          throw new BadRequestException(
            `no channel partner found with gcdCode ${payload.gcdCode}`
          );
        }
      } else if (payload.pan) {
        const encryptedResponse = await this.encryptionService.encrypt([
          payload.pan,
        ]);
        const encryptedPan = encryptedResponse?.[0]?.ecrypted;
        users = await this.dealerService.getDealersV2({
          pan_card: encryptedPan,
        });
        if (!users?.data?.length) {
          throw new BadRequestException(
            `no channel partner found with pan ${payload.pan}`
          );
        }
      }
      const userDocs = await this.getUserDocuments(users.data[0].iam_uuid);
      const formattedUsers = await this.formatCPSResponse(users.data);
      formattedUsers[0].documents = userDocs;
      return formattedUsers;
    }
    return [];
  }

  public async getUserDocuments(uuid: string): Promise<any> {
    const userDocsList = await this.apiPosService.getUserDocuments({ uuid });
    const userDocs = userDocsList.docs.map((document: any) => ({
      ...document,
      name: USER_DOC_LABEL_SLUG_MAP[document.docType],
    }));

    return userDocs;
  }

  public async prepareCpsPosdata(updatedUserDetails: any) {
    const prepareCpsPosdata = {
      isUuidPresent: true,
      mobile: updatedUserDetails.mobile,
      uuid: updatedUserDetails.uuid,
      ...(updatedUserDetails.email && {
        email: updatedUserDetails.email,
      }),
    };
    return prepareCpsPosdata;
  }
}
