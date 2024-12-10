package com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentStatus;
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
public class LeadVerifyEventHandler implements LeadEventHandler{
    private final LeadService leadService;
    private final AsyncEsSyncService leadSyncService;
    private final TransactionManagerImpl transactionManager;
    @SneakyThrows
    @Override
    public void handle(LeadStatusEventRequestDto leadRequest) {
        log.info("inside lead LeadVerifyEventHandler for leadId {}",leadRequest.getLeadId());
        Lead lead = leadService.fetchLeadByUuid(leadRequest.getLeadId());
        if(lead.getStatus().equals(LeadStatus.REGISTERED) || lead.getStatus().equals(LeadStatus.VERIFIED)){
            return;
        }
        if(lead.getStatus().equals(LeadStatus.REJECTED) || lead.getStatus().equals(LeadStatus.CLOSED) || lead.getStatus().equals(LeadStatus.CREATED) || lead.getStatus().equals(LeadStatus.DOCUMENTS_REUPLOAD_REQUIRED)){
            throw new RuntimeException("you are not allowed to share training material now");
        }
        lead.setStatus(LeadStatus.VERIFIED);
        lead.getDocuments().forEach(document -> document.setStatus(DocumentStatus.APPROVED));
    }

    @Override
    public LeadTrigger getName() {
        return LeadTrigger.VERIFY;
    }
}
