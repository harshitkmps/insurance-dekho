package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.models.Lead;

public interface PanVerificationService {

    Lead updatePanDetails(String leadId, String pan) throws Exception;
}
