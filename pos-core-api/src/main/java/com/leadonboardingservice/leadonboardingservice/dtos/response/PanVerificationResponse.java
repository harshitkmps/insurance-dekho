package com.leadonboardingservice.leadonboardingservice.dtos.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PanVerificationResponse {
    private String name;
    private boolean isPanValid;
    private String panStatus;
    private String panStatusCode;
}
