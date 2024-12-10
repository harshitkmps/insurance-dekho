package com.leadonboardingservice.leadonboardingservice.serviceimpls;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.response.IRDAIRegistrationResponse;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.helpers.TransactionManagerImpl;
import com.leadonboardingservice.leadonboardingservice.models.Config;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadProfile;
import com.leadonboardingservice.leadonboardingservice.repositories.ConfigRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadProfileRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import com.leadonboardingservice.leadonboardingservice.services.IIBService;
import com.leadonboardingservice.leadonboardingservice.services.IRDAIRegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
@Service
@RequiredArgsConstructor
@Slf4j
public class IRDAIRegistrationServiceImpl implements IRDAIRegistrationService {
    private final LeadRepository leadRepository;
    private final ConfigRepository configRepository;
    private final IIBService iibService;
    private final LeadProfileRepository leadProfileRepository;
    private final TransactionManagerImpl transactionManager;
    private final AsyncEsSyncService leadSyncService;
    
    @Override
    public void upsertLead(Long leadId) throws Exception{
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("lead not found with leadId "+leadId));
        LeadProfile leadProfile = lead.getLeadProfile();
        if (lead.getStatus().equals(LeadStatus.REGISTERED)
            || leadProfile == null
            || StringUtils.isEmpty(leadProfile.getPanEncrypted())
            || StringUtils.isNotEmpty(lead.getIrdaId())
        ) {
            return;
        }
        leadProfile.decryptAllPiiFields();
        if(shouldVerifyPanWithIIB(leadProfile)) {
            verifyPanWithIIB(lead, leadProfile);
        }
    }

    private boolean shouldVerifyPanWithIIB(LeadProfile leadProfile) {
        if(leadProfile.getIsPanVerified()) {
            log.info("pan  number for the leadId {} is already verified", leadProfile.getId());
            return false;
        }
        String pan = leadProfile.getPanDecrypted();
        List<Config> panExcepList = configRepository.findByConfigName(LeadConstants.IRDA_EXCEP_CONFIG_KEY);
        return panExcepList.isEmpty() || panExcepList.stream().noneMatch(config -> config.getConfigValues().contains(pan));
    }

    private void verifyPanWithIIB(Lead lead, LeadProfile leadProfile) throws Exception {
        log.info("verifying pan with IIB for lead {}", lead.getId());
        String pan = leadProfile.getPanDecrypted();
        IRDAIRegistrationResponse response = iibService.getIIBRegistration(pan);
        int isPanPresent = response.getData().get(0).getIsPanPresent();
        if (isPanPresent == 1) {
            lead.setStatus(LeadStatus.REJECTED);
            lead.setRejectionReason(LeadConstants.RejectionReason.PAN_REGISTERED_WITH_IRDAI);
            lead.setRejectionRemarksId(LeadConstants.RejectionRemarkId.PAN_REGISTERED_WITH_IRDAI);
            lead.getDocuments().stream().filter(x -> x.getType().equals(DocumentType.PAN))
                    .findFirst().ifPresent(x -> x.setIsDeleted(true));
            log.info("Lead rejected as PAN already registered with IRDAI for leadID " + lead.getId());
            leadRepository.save(lead);
        } else {
            leadProfile.setIsPanVerified(true);
            leadProfileRepository.save(leadProfile);
            log.info("PAN verified by IIB Automation API for lead " + leadProfile.getLead().getId());
        }
        syncLead(lead.getId());
    }

    private void syncLead(Long leadId) {
        transactionManager.executeAfterTransactionCommits(() -> leadSyncService.upsertLeadAsync(leadId));
    }
}
