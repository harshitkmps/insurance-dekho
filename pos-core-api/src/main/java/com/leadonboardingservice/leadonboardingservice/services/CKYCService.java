package com.leadonboardingservice.leadonboardingservice.services;


import com.leadonboardingservice.leadonboardingservice.dtos.request.CKYCSearchRequest;
import com.leadonboardingservice.leadonboardingservice.dtos.response.CKYCSearchResponse;
import com.leadonboardingservice.leadonboardingservice.models.Lead;

public interface CKYCService {

    Lead updateLeadKyc(String leadId, String pan, String dateOfBirth);

    CKYCSearchResponse searchCKYC(CKYCSearchRequest searchRequest);
}
