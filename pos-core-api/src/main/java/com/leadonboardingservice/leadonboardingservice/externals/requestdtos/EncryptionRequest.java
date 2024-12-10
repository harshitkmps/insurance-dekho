package com.leadonboardingservice.leadonboardingservice.externals.requestdtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class EncryptionRequest {
    @JsonProperty("data")
    private List<String> data;
}
