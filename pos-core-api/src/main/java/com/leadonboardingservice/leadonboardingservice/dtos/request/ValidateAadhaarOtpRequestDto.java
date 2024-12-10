package com.leadonboardingservice.leadonboardingservice.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidateAadhaarOtpRequestDto {
    @NotEmpty
    public String requestId;
    @NotEmpty
    public String otp;
    public boolean getProfileImage;
}
