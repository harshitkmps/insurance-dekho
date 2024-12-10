package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NocResponseDto {
    private String message;
    private Boolean nocStatus;
}
