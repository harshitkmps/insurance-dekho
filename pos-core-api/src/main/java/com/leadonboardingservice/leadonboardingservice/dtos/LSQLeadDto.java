package com.leadonboardingservice.leadonboardingservice.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class LSQLeadDto {
    @JsonProperty("LeadDetails")
    private List<LSQLeadDetailsDto> leadDetailsDtoList;
    @JsonProperty("Activity")
    private LSQLeadActivityDto lsqLeadActivity;
}
