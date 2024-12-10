package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.response.PanValidationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.PanVerificationResponse;

public interface PanVerificationAdapterService {
    PanVerificationResponse verifyPan(PanValidationRequestDto requestDto);
}
