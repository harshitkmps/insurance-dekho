package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.models.LeadFollowup;

public interface LeadFollowUpService {

    LeadFollowup updateLeadFollowupDetails(String leadId, LeadFollowup leadFollowup);
}
