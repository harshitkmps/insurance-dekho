package com.leadonboardingservice.leadonboardingservice.externals.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class IAMRequestDto {

    private String source;
    @JsonProperty("sub_source")
    private String subSource;
    @JsonProperty("auth_mode")
    private String authMode;
    private String name;
    private String email;
    private String mobile;
    private int status;
    @JsonProperty("tenant_id")
    private Long tenantId;
    private String referenceAuthId;
}
