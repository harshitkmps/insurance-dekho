package com.leadonboardingservice.leadonboardingservice.externals.requestdtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FraudAttributeRequestDto {
    private String key;
    private String value;
    @JsonProperty("isEncrypted")
    private boolean isEncrypted;
}
