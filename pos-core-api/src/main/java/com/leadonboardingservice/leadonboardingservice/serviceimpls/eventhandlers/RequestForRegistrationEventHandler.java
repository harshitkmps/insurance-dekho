package com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.enums.LeadTrigger;
import com.leadonboardingservice.leadonboardingservice.exceptions.ValidationException;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.helpers.TransactionManagerImpl;
import com.leadonboardingservice.leadonboardingservice.serviceimpls.FraudServiceImpl;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadService;
import com.leadonboardingservice.leadonboardingservice.validators.LeadStatusValidator;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class RequestForRegistrationEventHandler implements LeadEventHandler{

    private final LeadService leadService;
    private final LeadStatusValidator leadStatusValidator;
    private final AsyncEsSyncService leadSyncService;
    private final FraudServiceImpl fraudService;
    private final TransactionManagerImpl transactionManager;
    @SneakyThrows
    @Override
    public void handle(LeadStatusEventRequestDto leadRequest) throws ValidationException {
        log.info("inside RequestForRegistrationEventHandler for lead {} ",leadRequest.getLeadId());
        Lead lead = leadService.fetchLeadByUuid(leadRequest.getLeadId());
        validateLeadForRegistrationRequested(lead);
        fraudService.validateLeadForFraud(lead);
        lead.setStatus(LeadStatus.REGISTRATION_REQUESTED);
        transactionManager.executeAfterTransactionCommits(() ->leadSyncService.upsertLeadAsync(lead.getId()));
    }

    private void validateLeadForRegistrationRequested(Lead lead) throws ValidationException{
        if(!(lead.getStatus().equals(LeadStatus.CREATED)  || lead.getStatus().equals(LeadStatus.VERIFIED)  || lead.getStatus().equals(LeadStatus.DOCUMENTS_REUPLOAD_REQUIRED))){
            throw new ValidationException("lead cannot be sent for registration. Current lead state " + lead.getStatus());
        }
        Optional<String> errorMessage = leadStatusValidator.isReadyToMoveToQC(lead);
        if(errorMessage.isPresent()){
            throw new ValidationException(errorMessage.get());
        }
    }

    public void checkLeadEligibleForQC(String leadUUID) throws Exception {
        log.info("inside RequestForRegistrationEventHandler for lead {} ",leadUUID);
        Lead lead = leadService.fetchLeadByUuid(leadUUID);
        validateLeadForRegistrationRequested(lead);
    }

    @Override
    public LeadTrigger getName() {
        return LeadTrigger.REQUEST_FOR_REGISTRATION;
    }
}
