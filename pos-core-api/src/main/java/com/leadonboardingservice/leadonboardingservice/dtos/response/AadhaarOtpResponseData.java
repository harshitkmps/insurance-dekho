package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AadhaarOtpResponseData {
    private String requestId;
    private String message;
    private Boolean otpSentStatus;
    private Boolean isValidAadhaar;
}