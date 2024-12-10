package com.leadonboardingservice.leadonboardingservice.services;

public interface LeadSyncService {

    void syncLeadFromCps(String leadId) throws Exception;
    void syncLeadFromIAM(String leadId) throws Exception;
}
