package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UpdateLeadBasicDetailsResponseDto {
    private String uuid;

    private String name;

    private Integer cityId;
}
