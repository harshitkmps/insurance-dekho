package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.response.BankVerificationResponseDto;
import com.leadonboardingservice.leadonboardingservice.exceptions.PennyDropException;

public interface BankVerificationService {

    BankVerificationResponseDto verifyAccount(String leadId) throws PennyDropException;

}
