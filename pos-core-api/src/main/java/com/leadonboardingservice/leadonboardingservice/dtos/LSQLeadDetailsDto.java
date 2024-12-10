package com.leadonboardingservice.leadonboardingservice.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.leadonboardingservice.leadonboardingservice.enums.LSQLeadDetailAttribute;
import lombok.*;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class LSQLeadDetailsDto {
    @JsonProperty("Attribute")
    private String attribute;
    @JsonProperty("Value")
    private String value;
}
