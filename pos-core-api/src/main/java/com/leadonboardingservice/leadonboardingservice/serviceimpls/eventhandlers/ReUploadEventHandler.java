package com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.enums.LeadTrigger;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.helpers.TransactionManagerImpl;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class ReUploadEventHandler implements LeadEventHandler{
    private final LeadService leadService;
    private final AsyncEsSyncService leadSyncService;
    private final TransactionManagerImpl transactionManager;
    @SneakyThrows
    @Override
    public void handle(LeadStatusEventRequestDto leadRequest) {
        log.info("inside lead ReUploadEventHandler for leadId {}",leadRequest.getLeadId());
        Lead lead = leadService.fetchLeadByUuid(leadRequest.getLeadId());
        if (lead.getStatus().equals(LeadStatus.REGISTRATION_REQUESTED)){
            log.info("updating lead status to {}",LeadStatus.DOCUMENTS_REUPLOAD_REQUIRED);
            lead.setStatus(LeadStatus.DOCUMENTS_REUPLOAD_REQUIRED);
            transactionManager.executeAfterTransactionCommits(() ->leadSyncService.upsertLeadAsync(lead.getId()));
            return;
        }
        //throw new RuntimeException("lead status cannot be moved to "+LeadStatus.DOCUMENTS_REUPLOAD_REQUIRED);
    }

    @Override
    public LeadTrigger getName() {
        return LeadTrigger.DOCUMENTS_REUPLOAD;
    }
}
