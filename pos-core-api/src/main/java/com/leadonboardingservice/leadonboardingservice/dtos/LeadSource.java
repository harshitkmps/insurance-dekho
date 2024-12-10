package com.leadonboardingservice.leadonboardingservice.dtos;

import lombok.*;

@Getter
@Builder
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LeadSource {
    private String utmSource;

    private String utmMedium;

    private String utmCampaign;
}
