package com.leadonboardingservice.leadonboardingservice.externals.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class IAMUpdateRequestDto {
    private String name;
    private String email;
    private String mobile;
    @JsonProperty("tenant_id")
    private long tenantId;
    private String referenceAuthId;
}
