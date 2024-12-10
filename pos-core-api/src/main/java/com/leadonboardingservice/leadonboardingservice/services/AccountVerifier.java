package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.request.BankVerificationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.BankVerificationResponseDto;
import com.leadonboardingservice.leadonboardingservice.exceptions.PennyDropException;

public interface AccountVerifier {
    BankVerificationResponseDto verifyAccount(BankVerificationRequestDto requestDto) throws PennyDropException;

    String getName();
}
