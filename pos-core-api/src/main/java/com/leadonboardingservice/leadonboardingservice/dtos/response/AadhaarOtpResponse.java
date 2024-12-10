package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AadhaarOtpResponse {
    private int statusCode;
    private String message;
    private AadhaarOtpResponseData data;
}
