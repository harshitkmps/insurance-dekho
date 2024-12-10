package com.leadonboardingservice.leadonboardingservice.externals.requestdtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FraudSearchRequestDto {

    @JsonProperty("data")
    List<FraudAttributeRequestDto> requestDtoList;
}
