package com.leadonboardingservice.leadonboardingservice.externals.requestdtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateChannelPartnerRequestDto {
    private String channelPartnerId;
    @JsonProperty("onboarded_on_life")
    private Boolean onBoardedOnLife;
    @JsonProperty("life_onboarding_date")
    private String lifeOnboardingDate;
    @JsonProperty("onboarded_on_general")
    private Boolean onBoardedOnGeneral;
    @JsonProperty("general_onboarding_date")
    private String generalOnboardingDate;
}
