package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.models.LeadProfile;

public interface LeadProfileService {

    //LeadProfile updateLeadProfile(LeadProfileDto leadProfileDto, String leadUUID) throws ValidationException;

    LeadProfile updateLeadProfile(String leadId, LeadProfile leadProfile);
}
