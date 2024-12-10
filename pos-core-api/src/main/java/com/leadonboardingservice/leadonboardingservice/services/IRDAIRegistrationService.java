package com.leadonboardingservice.leadonboardingservice.services;

public interface IRDAIRegistrationService {
    void upsertLead(Long leadId) throws Exception;
}
