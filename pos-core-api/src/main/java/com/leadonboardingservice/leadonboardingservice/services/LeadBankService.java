package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.models.BankDetail;

public interface LeadBankService {
    BankDetail updateLeadBankDetails(String leadUUID, BankDetail bankDetail);
}
