package com.leadonboardingservice.leadonboardingservice.externals.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class IAMResponseDto {

    private String statusCode;
    private String status;
    private IAMResponse data;
    private String message;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class IAMResponse {
        private String uuid;
        private String mobile;
        private String email;
        private Boolean status;
        @JsonProperty("tenant_id")
        private Long tenantId;
        private String referenceAuthId;
    }
}
