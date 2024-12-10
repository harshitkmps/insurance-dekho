package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.request.SyncLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLead;
public interface LeadMigrationService {

    void migrateLeads(OldLead oldLead) throws Exception;

    void syncLeads(Long leadId, SyncLeadRequestDto syncLeadDto) throws Exception;

    Lead createLeadFromUser(String leadId) throws Exception;
}
