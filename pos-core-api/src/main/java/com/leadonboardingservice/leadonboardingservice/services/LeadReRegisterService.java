package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.response.NocResponseDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.PanValidationRequestDto;

public interface LeadReRegisterService {
    void reRegisterLead(String leadId) throws Exception;
    NocResponseDto checkNocStatus(String leadId, PanValidationRequestDto panDetails) throws Exception;
    void updateNocStatus(String leadId, String nocStatus) throws Exception;
}
