package com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.enums.LeadTrigger;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.BankDetail;
import com.leadonboardingservice.leadonboardingservice.models.BaseEntity;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadBankRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadProfileRepository;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional

public class LeadNocEventHandler implements LeadEventHandler{
    private final LeadService leadService;
    private final AsyncEsSyncService leadSyncService;
    private final LeadProfileRepository leadProfileRepository;
    private final LeadBankRepository leadBankRepository;
    @SneakyThrows
    @Override
    public void handle(LeadStatusEventRequestDto leadRequest) {
        log.info("inside lead LeadNocEventHandler for leadId {}",leadRequest.getLeadId());

        Lead lead = leadService.fetchLeadByUuid(leadRequest.getLeadId());
        log.info("lead before encryption of all pii fields {}", lead);
        if(lead.getStatus().equals(LeadStatus.REGISTERED)){
            lead.decryptAllPiiFields();//decrypt all pii fields
            lead.setMobileDecrypted(lead.getMobileDecrypted() + UUID.randomUUID().toString());
            lead.setEmailDecrypted(lead.getEmailDecrypted() + UUID.randomUUID().toString());
            lead.addPiiFields();
            lead.getLeadProfile().decryptAllPiiFields();
            lead.getLeadProfile().setPanDecrypted(lead.getLeadProfile().getPanDecrypted() + UUID.randomUUID().toString());
            lead.getLeadProfile().addPiiFields();
            Optional<BankDetail> optionalBankDetail = getActiveBankDetail(lead.getBankDetails());
            optionalBankDetail.ifPresent(BaseEntity::decryptAllPiiFields);
            BankDetail bankDetail = optionalBankDetail.get();
            bankDetail.decryptAllPiiFields();
            bankDetail.setAccountNumberDecrypted(bankDetail.getAccountNumberDecrypted() + UUID.randomUUID().toString());
            bankDetail.addPiiFields();
            lead.setStatus(LeadStatus.NOC_GIVEN);
            leadProfileRepository.save(lead.getLeadProfile());
            leadBankRepository.save(bankDetail);
            return;
        }
        throw new RuntimeException("Unable to reject. Invalid current lead status. Lead status must be Registered. Current leadStatus: "+lead.getStatus());
    }

    @Override
    public LeadTrigger getName() {
        return LeadTrigger.NOC_GIVEN;
    }
    private Optional<BankDetail> getActiveBankDetail(List<BankDetail> bankDetailList){
        return bankDetailList.stream().filter(x -> x.getIsActive() && x.getIsBankVerified()).findFirst();
    }
}
