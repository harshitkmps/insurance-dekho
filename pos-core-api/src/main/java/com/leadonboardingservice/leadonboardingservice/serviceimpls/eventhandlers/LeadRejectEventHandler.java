package com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.enums.LeadTrigger;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.BankDetail;
import com.leadonboardingservice.leadonboardingservice.helpers.TransactionManagerImpl;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadService;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class LeadRejectEventHandler implements LeadEventHandler{
    private final LeadService leadService;
    private final AsyncEsSyncService leadSyncService;
    private final TransactionManagerImpl transactionManager;
    @SneakyThrows
    @Override
    public void handle(LeadStatusEventRequestDto leadRequest) {
        log.info("inside lead LeadRejectEventHandler for leadId {}",leadRequest.getLeadId());
        Lead lead = leadService.fetchLeadByUuid(leadRequest.getLeadId());
        if(lead.getStatus().equals(LeadStatus.REGISTERED)){
            throw new RuntimeException("lead already registered");
        }
        if(lead.getStatus().equals(LeadStatus.REJECTED)){
            throw new RuntimeException("lead already rejected");
        }
        if(leadRequest.getData() == null || leadRequest.getData().get("rejectionReason") == null){
            throw new RuntimeException("lead rejection reason required to close lead");
        }
        if(lead.getStatus().equals(LeadStatus.REGISTRATION_REQUESTED) || lead.getStatus().equals(LeadStatus.VERIFIED)){
            lead.setRejectionReason(leadRequest.getData().get("rejectionReason"));
            lead.setRejectionRemarksId(leadRequest.getData().get("rejectionRemarksId"));
            lead.setStatus(LeadStatus.REJECTED);
            if(leadRequest.getData().get("rejectionReason").equals(LeadConstants.LEAD_REJECTION_WITH_ALREADY_REGISTERED_PAN)) {
                if(lead.getLeadProfile() != null){
                    lead.getLeadProfile().clearPan();
                }
                Optional<BankDetail> optionalBankDetail = getActiveBankDetail(lead.getBankDetails());
                if(optionalBankDetail.isPresent()) {
                    BankDetail bankDetail = optionalBankDetail.get();
                    bankDetail.clearBankDetails();
                }
                lead.getDocuments().forEach(x -> x.setIsDeleted(true));
                lead.setStatus(LeadStatus.CREATED);
            }else if(leadRequest.getData().get("rejectionRemarksId").equals(LeadConstants.RejectionRemarkId.PAN_REGISTERED_WITH_IRDAI)) {
                lead.getDocuments().stream().filter(x -> x.getType().equals(DocumentType.PAN))
                        .findFirst().ifPresent(x -> x.setIsDeleted(true));
            }else if(leadRequest.getData().get("rejectionRemarksId").equals(LeadConstants.RejectionRemarkId.BENEFICIARY_NAME_CONFLICT)){
                Optional.ofNullable(lead.getBankDetails()).
                        ifPresent(bankDetails -> bankDetails.forEach(BankDetail::clearBankDetails));
            }
            transactionManager.executeAfterTransactionCommits(() ->leadSyncService.upsertLeadAsync(lead.getId()));
            return;
        }
        throw new RuntimeException("Unable to reject. Invalid current lead status. Lead status must be REGISTRATION_REQUESTED or VERIFIED. Current leadStatus: "+lead.getStatus());
    }

    @Override
    public LeadTrigger getName() {
        return LeadTrigger.REJECT;
    }
    private Optional<BankDetail> getActiveBankDetail(List<BankDetail> bankDetailList){
        return bankDetailList.stream().filter(x -> x.getIsActive() && x.getIsBankVerified()).findFirst();
    }
}
