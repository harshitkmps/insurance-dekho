package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RemarksDto {
    private Long id;

    private String category;

    private String text;
}
