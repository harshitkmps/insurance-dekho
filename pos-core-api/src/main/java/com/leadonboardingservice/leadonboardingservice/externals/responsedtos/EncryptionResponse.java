package com.leadonboardingservice.leadonboardingservice.externals.responsedtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EncryptionResponse {
    @JsonProperty("data")
    private List<EncryptedDto> data;
}
