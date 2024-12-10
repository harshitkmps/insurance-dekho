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
public class LeadCloseEventHandler implements LeadEventHandler{
    private final LeadService leadService;
    private final AsyncEsSyncService leadSyncService;
    private final TransactionManagerImpl transactionManager;
    @SneakyThrows
    @Override
    public void handle(LeadStatusEventRequestDto leadRequest) {
        log.info("inside lead LeadCloseEventHandler for leadId {}",leadRequest.getLeadId());
        Lead lead = leadService.fetchLeadByUuid(leadRequest.getLeadId());
        if(lead.getStatus().equals(LeadStatus.REGISTERED)){
            throw new RuntimeException("lead already registered");
        }
        if(leadRequest.getData() == null || leadRequest.getData().get("remarkId") == null){
            throw new RuntimeException("lead reason/remark id required to close lead");
        }
        lead.setClosedStatusRemarkId(Integer.valueOf(leadRequest.getData().get("remarkId")));
        lead.setStatus(LeadStatus.CLOSED);
        transactionManager.executeAfterTransactionCommits(() ->leadSyncService.upsertLeadAsync(lead.getId()));
    }

    @Override
    public LeadTrigger getName() {
        return LeadTrigger.CLOSE;
    }
}
