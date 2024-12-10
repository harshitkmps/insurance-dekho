package com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.enums.LeadTrigger;
import com.leadonboardingservice.leadonboardingservice.exceptions.InvalidRequestException;
import com.leadonboardingservice.leadonboardingservice.helpers.TransactionManagerImpl;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadService;
import com.leadonboardingservice.leadonboardingservice.services.LeadSyncService;
import com.leadonboardingservice.leadonboardingservice.validators.ReopenLeadValidator;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class LeadReopenEventHandler implements LeadEventHandler {

    private final LeadService leadService;
    private final AsyncEsSyncService leadAsyncService;
    private final TransactionManagerImpl transactionManager;
    private final List<ReopenLeadValidator> leadValidators;
    private final LeadSyncService leadSyncService;

    @SneakyThrows
    @Override
    public void handle(LeadStatusEventRequestDto leadRequest) {
        log.info("inside lead LeadReopenEventHandler for leadId {}",leadRequest.getLeadId());
        Lead lead = leadService.fetchLeadByUuid(leadRequest.getLeadId());
        if(!lead.getStatus().equals(LeadStatus.CLOSED)){
            throw new RuntimeException("lead already active. Current State "+lead.getStatus());
        }
        Optional<String> errors = validateLead(lead);
        if(errors.isPresent()){
            throw new InvalidRequestException(errors.get());
        }
        leadSyncService.syncLeadFromIAM(lead.getUuid());
        lead.setStatus(LeadStatus.CREATED);
        transactionManager.executeAfterTransactionCommits(
                () ->leadAsyncService.upsertLeadAsync(lead.getId())
        );
    }

    @Override
    public LeadTrigger getName() {
        return LeadTrigger.REOPEN;
    }

    private Optional<String> validateLead(Lead lead) {
        log.info("validating lead for re-opening event {}",lead.getUuid());
        List<String> errors = new ArrayList<>();
        leadValidators.forEach(validator -> {
            if(errors.isEmpty()) {
                Optional<String> error = validator.validate(lead);
                error.ifPresent(errors::add);
            }
        });
        return Optional.empty();
    }
}
