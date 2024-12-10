package com.leadonboardingservice.leadonboardingservice.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Builder
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChannelPartnerPropertiesDto {
    @JsonProperty("lead_creation_date")
    private String leadCreationDate;
}
