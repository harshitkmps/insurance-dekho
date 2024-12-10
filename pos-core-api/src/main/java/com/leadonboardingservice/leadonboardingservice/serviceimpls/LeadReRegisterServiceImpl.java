package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.response.NocResponseDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.PanValidationRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.exceptions.ForbiddenRequestException;
import com.leadonboardingservice.leadonboardingservice.exceptions.InvalidRequestException;
import com.leadonboardingservice.leadonboardingservice.helpers.HashGenerator;
import com.leadonboardingservice.leadonboardingservice.helpers.TransactionManagerImpl;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadAdditionalDetails;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadAdditionalDetailsService;
import com.leadonboardingservice.leadonboardingservice.services.LeadReRegisterService;
import com.leadonboardingservice.leadonboardingservice.services.LeadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeadReRegisterServiceImpl implements LeadReRegisterService {


    private final LeadService leadService;
    private final LeadAdditionalDetailsService leadAdditionalDetailsService;
    private final AsyncEsSyncService leadSyncService;
    private final TransactionManagerImpl transactionManager;
    private final HashGenerator hashGenerator;

    private Optional<String> validateLeadForReRegistration(Lead lead) {
        if (!lead.getStatus().equals(LeadStatus.REGISTERED)) {
            return Optional.of("lead is not registered");
        }
        if (lead.getIrdaId() != null && !lead.getIrdaId().isEmpty()) {
            return Optional.of("lead already present in POS with irdaId " + lead.getIrdaId());
        }
        if (lead.getTenantId() != 1) {
            return Optional.of("lead with given tenant id is not allowed to re-register ");
        }
        return Optional.empty();
    }

    @Override
    public void reRegisterLead(String leadId) throws Exception {
        Lead lead = leadService.fetchLeadByUuid(leadId);
        Optional<String> error = validateLeadForReRegistration(lead);
        if (error.isPresent()) {
            throw new ForbiddenRequestException(error.get());
        }
        log.info("re-registering lead for leadId {}", leadId);
        List<LeadAdditionalDetails> leadAdditionalDetailsList = new ArrayList<>();
        leadAdditionalDetailsList.add(new LeadAdditionalDetails(LeadConstants.RE_REGISTER, "1"));
        leadAdditionalDetailsList.add(new LeadAdditionalDetails(LeadConstants.NOC_REQ, "1"));
        if (lead.getLeadProfile() != null && lead.getLeadProfile().getPanHashed() != null) {
           leadAdditionalDetailsList.add(new LeadAdditionalDetails(LeadConstants.OLD_PAN, lead.getLeadProfile().getPanHashed()));
        }
        lead.setStatus(LeadStatus.CREATED);
        leadAdditionalDetailsService.addDetails(leadId, leadAdditionalDetailsList);
        log.info("lead migrated successfully for leadId {}", leadId);
        syncLead(lead.getId());
    }

    private void syncLead(Long leadId) {
        transactionManager.executeAfterTransactionCommits(() -> leadSyncService.upsertLeadAsync(leadId));
    }

    @Override
    public NocResponseDto checkNocStatus(String leadId, PanValidationRequestDto panDetails) throws Exception {
        log.info("checking noc status for the lead {}", leadId);
        if (panDetails.getPan() == null || panDetails.getPan().isEmpty()) {
            throw new ForbiddenRequestException("Pan number is Required to check NOC status");
        }
        return checkIsNocReqForPan(leadId, panDetails);
    }

    private NocResponseDto checkIsNocReqForPan(String leadId, PanValidationRequestDto panDetails) throws Exception {
        Lead lead = leadService.fetchLeadByUuid(leadId);
        Map<String, String> leadDetailsMap = lead.getLeadAdditionalDetails()
                .stream()
                .collect(Collectors.toMap(LeadAdditionalDetails::getPropertyName, LeadAdditionalDetails::getPropertyValue,(oldkey,newkey) -> {
                    log.info("Duplicate key found in additional details ");
                    return newkey;
                }));
        String migrationDetails = leadDetailsMap.get(LeadConstants.RE_REGISTER);
        String existingPanHashed = leadDetailsMap.get(LeadConstants.OLD_PAN);
        String panHashed = hashGenerator.generate(panDetails.getPan());

        if (!(migrationDetails != null && migrationDetails.equals("1"))) {
            throw new InvalidRequestException("lead not migrated");
        }
        NocResponseDto.NocResponseDtoBuilder nocResponse = NocResponseDto.builder();

        if (existingPanHashed != null && existingPanHashed.equals(panHashed)) {
            log.info("noc required for the pan entered by the lead {} ", leadId);
            nocResponse.message("Noc required for existing pan").nocStatus(true);
        } else {
            log.info("new pan entered by the lead {} ", leadId);
            nocResponse.message("Noc not required").nocStatus(false);
        }
        return nocResponse.build();
    }

    @Override
    public void updateNocStatus(String leadId, String nocStatus) throws Exception {
        Lead lead = leadService.fetchLeadByUuid(leadId);
        Optional<LeadAdditionalDetails> reRegisterDetail = lead.getLeadAdditionalDetails().stream()
                .filter(x -> x.getPropertyName().equals(LeadConstants.RE_REGISTER) && "1".equals(x.getPropertyValue()))
                .findFirst();
        if(reRegisterDetail.isEmpty()) {return; }
        log.info("updating noc status {} for the lead {}",nocStatus,leadId);
        List<LeadAdditionalDetails> leadAdditionalDetailsList = new ArrayList<>();
        leadAdditionalDetailsList.add(new LeadAdditionalDetails(LeadConstants.NOC_REQ, nocStatus));
        leadAdditionalDetailsService.addDetails(lead.getUuid(), leadAdditionalDetailsList);
    }

}
