package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.response.PanValidationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.PanVerificationResponse;

public interface PanVerifier {
    PanVerificationResponse verifyPan(PanValidationRequestDto requestDto);

    String getName();
}
