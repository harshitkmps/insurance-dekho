package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.request.ValidateAadhaarOtpRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.OtpRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.AadhaarOtpResponseData;
import com.leadonboardingservice.leadonboardingservice.models.Lead;

public interface AadhaarService {
    AadhaarOtpResponseData sendAadhaarOtp(OtpRequestDto otpRequestDto) throws Exception;
    Lead fetchLeadAadhaarDetails(String leadId, ValidateAadhaarOtpRequestDto requestId) throws Exception;
}
