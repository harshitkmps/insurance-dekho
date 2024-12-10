package com.leadonboardingservice.leadonboardingservice.externals.requestdtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.leadonboardingservice.leadonboardingservice.dtos.ChannelPartnerPropertiesDto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ChannelPartnerRequestDto {

    private Integer id;
    private String channelPartnerId;
    @JsonProperty("iam_uuid")
    private String iamUUID;
    @JsonProperty("tenant_id")
    private Integer tenantId;
    private Integer status;
    @JsonProperty("onboarded_on_life")
    private Boolean onBoardedOnLife;
    @JsonProperty("life_onboarding_date")
    private String lifeOnboardingDate;
    @JsonProperty("onboarded_on_general")
    private Boolean onBoardedOnGeneral;
    @JsonProperty("general_onboarding_date")
    private String generalOnboardingDate;
    private String organization;
    @JsonProperty("employment_type")
    private String employmentType;
    @JsonProperty("irda_id")
    private String irdaId;
    private String irdaIdEncrypted;
    private String irdaIdMasked;
    @JsonProperty("rm_mobile")
    private String rmMobile;
    @JsonProperty("rm_iam_uuid")
    private String rmIamUuid;
    private String address;
    @JsonProperty("work_address")
    private String workAddress;
    @JsonProperty("pincode")
    private String pinCode;
    @JsonProperty("work_pincode")
    private String workPinCode;
    @JsonProperty("city_id")
    private Integer cityId;
    @JsonProperty("work_city_id")
    private Integer workCityId;
    @JsonProperty("state_id")
    private Integer stateId;
    private String source;
    @JsonProperty("channel_partner_type")
    private String channelPartnerType;
    private String name;
    private String mobile;
    private String mobileEncrypted;
    private String mobileMasked;
    private String email;
    private String emailEncrypted;
    private String emailMasked;
    @JsonProperty("date_of_birth")
    private LocalDate dateOfBirth;
    @JsonProperty("pan_card")
    private String panCard;
    private String panCardEncrypted;
    @JsonProperty("account_number")
    private String accountNumber;
    @JsonProperty("account_number_encrypted")
    private String accountNumberEncrypted;
    @JsonProperty("ifsc")
    private String ifsc;
    @JsonProperty("bank_id")
    private String bankId;
    private String panCardMasked;
    @JsonProperty("referrer_cps_id")
    private String referrerCpsId;
    @JsonProperty("created_by")
    private String createdBy;
    @JsonProperty("beneficiary_id")
    private String beneficiaryId;
    @JsonProperty("beneficiary_name")
    private String beneficiaryName;
    @JsonProperty("gst_number")
    private String gstNumber;
    private String modifiedBy;
    @JsonProperty("is_joint_bank_account")
    private Integer isJointBankAccount;
    private String gender;
    private ChannelPartnerPropertiesDto properties;
}
