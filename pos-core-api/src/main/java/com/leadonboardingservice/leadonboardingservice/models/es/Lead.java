package com.leadonboardingservice.leadonboardingservice.models.es;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Lead implements Serializable {
    @JsonProperty("id")
    private Long id;
    @JsonProperty("gcd_code")
    private String gcdCode;
    @JsonProperty("dealer_id")
    private String dealerId;
    @JsonProperty("lead_token")
    private String leadToken;
    @JsonProperty("uuid")
    private String uuid;
    @JsonProperty("irda_id")
    private String irdaId;
    @JsonProperty("irda_reporting_date")
    private String irdaReportingDate;
    @JsonProperty("name")
    private String name;
    @JsonProperty("mobile_hash")
    private String mobileHash;
    @JsonProperty("mobile_encrypt")
    private String mobileEncrypted;
    @JsonProperty("mobile_mask")
    private String mobileMask;
    @JsonProperty("email_hash")
    private String emailHash;
    @JsonProperty("email_encrypt")
    private String emailEncrypted;
    @JsonProperty("email_mask")
    private String emailMask;
    @JsonProperty("lead_origin")
    private String leadOrigin;
    @JsonProperty("lead_owner_uuid")
    private String leadOwnerIamUUID;
    @JsonProperty("lead_creator_uuid")
    private String leadCreatorIamUUID;
    @JsonProperty("refer_dealer_id")
    private String referDealerId;
    @JsonProperty("path")
    private String path;
    @JsonProperty("utm_source")
    private String utmSource;
    @JsonProperty("is_re_register")
    private Boolean reRegister;
    @JsonProperty("is_noc_required")
    private Boolean nocRequired;
    @JsonProperty("lead_state")
    private String leadState;
    /*@JsonProperty("lead_document_rejection_reason")
    private String leadDocumentRejectionReason;*/
    @JsonProperty("reg_remarks")
    private String leadRejectionReason;
    @JsonProperty("lead_close_reason")
    private String leadCloseReason;
    @JsonProperty("life_insurance_reg")
    private JsonNode lifeInsuranceReg;
    @JsonProperty("general_insurance_reg")
    private JsonNode generalInsuranceReg;
    @JsonProperty("created_at")
    private String createdAt;
    @JsonProperty("updated_at")
    private String updatedAt;
    @JsonProperty("master_details")
    private JsonNode masterDetails;
    @JsonProperty("assignee_details")
    private JsonNode assigneeDetails;
    @JsonProperty("pos_creation_date")
    private String posCreationDate;
    @JsonProperty("city_id")
    private Integer cityId;
    @JsonProperty("tenant_id")
    private Integer tenantId;
    @JsonProperty("lead_history")
    private JsonNode leadHistory;

    //these annotations are used to remove nesting objects and save hierarchy details at root level
    @JsonIgnore
    private Map<String,UserReportingData> hierarchyDetails = new HashMap<>();
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class UserReportingData {
        private String name;
        private String email;
        private String gcdCode;
    }

    @JsonAnySetter
    public void add(String key, UserReportingData value) {
        hierarchyDetails.put(key, value);
    }

    @JsonAnyGetter
    public Map<String,UserReportingData> getMap() {
        return hierarchyDetails;
    }
}
