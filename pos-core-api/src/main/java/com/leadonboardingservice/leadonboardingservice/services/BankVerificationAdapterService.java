package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.request.BankVerificationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.BankVerificationResponseDto;
import com.leadonboardingservice.leadonboardingservice.exceptions.PennyDropException;

public interface BankVerificationAdapterService {
       BankVerificationResponseDto verifyAccount(BankVerificationRequestDto bankVerificationRequestDto) throws PennyDropException;
}