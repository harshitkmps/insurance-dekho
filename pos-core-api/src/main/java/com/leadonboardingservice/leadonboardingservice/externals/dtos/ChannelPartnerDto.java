package com.leadonboardingservice.leadonboardingservice.externals.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChannelPartnerDto implements Serializable {

    private Integer id;
    @JsonProperty("tenant_id")
    private Integer tenantId;
    @JsonProperty("cps_id")
    private String channelPartnerId;
    @JsonProperty("iam_uuid")
    private String iamUUID;
    @JsonProperty("reporting_sfa_id")
    private String reportingManagerSfaId;
    private Integer status;
    @JsonProperty("onboarded_on_general")
    private Boolean onBoardedOnGeneral;
    @JsonProperty("general_onboarding_date")
    private LocalDateTime generalOnboardingDate;
    @JsonProperty("onboarded_on_life")
    private Boolean onBoardedOnLife;
    @JsonProperty("life_onboarding_date")
    private LocalDateTime lifeOnboardingDate;
    @JsonProperty("gcd_code")
    private String gcdCode;
    @JsonProperty("dealer_id")
    private Integer dealerId;
    private String organization;
    private String employmentType;
    @JsonProperty("irda_id")
    private String irdaId;
    private String irdaIdEncrypted;
    private String irdaIdMasked;
    private String address;
    @JsonProperty("pincode")
    private String pinCode;
    @JsonProperty("city_id")
    private Integer cityId;
    @JsonProperty("state_id")
    private Integer stateId;
    private String source;
    @JsonProperty("channel_partner_type")
    private String channelPartnerType;
    private String name;
    private String gender;
    private String mobile;
    private String mobileEncrypted;
    @JsonProperty("masked_mobile")
    private String mobileMasked;
    private String email;
    private String emailEncrypted;
    private String emailMasked;
    @JsonProperty("date_of_birth")
    private LocalDateTime dateOfBirth;
    private String panCard;
    @JsonProperty("pan_card")
    private String panCardEncrypted;
    private String panCardMasked;
    @JsonProperty("referrer_id")
    private Integer referrerId;
    private LocalDateTime created;
    private LocalDateTime modified;
    @JsonProperty("created_by")
    private String createdBy;
    private String modifiedBy;
    @JsonProperty("sales_agents")
    private Map<String, List<SalesAgentsDto>> salesAgents;
    @JsonProperty("is_joint_bank_account")
    private Boolean isJointBankAccount;
    @JsonProperty("beneficiary_name")
    private String beneficiaryName;
    @JsonProperty("account_number")
    private String accountNumber;
    @JsonProperty("masked_account_number")
    private String accountNumberMasked;
    @JsonProperty("ifsc_code")
    private String ifsc;
    @JsonProperty("masked_ifsc_code")
    private String ifscMasked;
    @JsonProperty("team_rm_mapping")
    private List<TeamRmMappingDto> teamRmMapping;
}
