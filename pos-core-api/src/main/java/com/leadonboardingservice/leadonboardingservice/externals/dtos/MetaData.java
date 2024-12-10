package com.leadonboardingservice.leadonboardingservice.externals.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MetaData {
    @JsonProperty("correlation-id")
    private String correlationId;
    @JsonProperty("reference-id")
    private String referenceId;
    @JsonProperty("code")
    private Integer code;
    @JsonProperty("message")
    private String message;
}
