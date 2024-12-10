package com.leadonboardingservice.leadonboardingservice.dtos.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.leadonboardingservice.leadonboardingservice.models.es.Lead;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeadResponseDto {
    private Long id;
    private String gcdCode;
    private String dealerId;
    private String leadToken;
    private String uuid;
    private String irdaId;
    private String irdaReportingDate;
    private String name;
    private String mobileHash;
    private String mobileEncrypted;
    private String mobileMask;
    private String emailHash;
    private String emailEncrypted;
    private String emailMask;
    private Boolean reRegister;
    private Boolean nocRequired;
    private String leadOrigin;
    private String leadOwnerIamUUID;
    private String leadCreatorIamUUID;
    private String referDealerId;
    private String path;
    private String utmSource;
    private JsonNode lifeInsuranceReg;
    private JsonNode generalInsuranceReg;
    private String leadState;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private JsonNode masterDetails;
    private JsonNode assigneeDetails;
    private String posCreationDate;
    private Integer cityId;
    private String leadRejectionReason;
    private Integer tenantId;
    private JsonNode leadHistory;
    private Map<String, Lead.UserReportingData> hierarchyDetails;
}
