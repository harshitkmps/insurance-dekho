package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.externals.ChannelPartnerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.IAMServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.IAMResponseDto;
import com.leadonboardingservice.leadonboardingservice.helpers.NullAwareBeanUtilsBean;
import com.leadonboardingservice.leadonboardingservice.helpers.TransactionManagerImpl;
import com.leadonboardingservice.leadonboardingservice.mappers.LeadBasicDetailsMapper;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadBasicDetailsService;
import com.leadonboardingservice.leadonboardingservice.services.LeadSyncService;

import com.leadonboardingservice.leadonboardingservice.services.LeadService;
import com.leadonboardingservice.leadonboardingservice.validators.DuplicateLeadValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class LeadSyncServiceImpl implements LeadSyncService {

    private final ChannelPartnerServiceApiHelper channelPartnerServiceApiHelper;
    private final LeadService leadService;
    private final TransactionManagerImpl transactionManager;
    private final AsyncEsSyncService leadAsyncService;
    private final IAMServiceApiHelper iamServiceApiHelper;
    private final LeadBasicDetailsMapper leadBasicDetailsMapper;
    private final DuplicateLeadValidator duplicateLeadValidator;
    private final LeadBasicDetailsService leadBasicDetailsService;

    @Override
    public void syncLeadFromCps(String leadId) throws Exception {
        try {
            Lead lead = leadService.fetchLeadByUuid(leadId);
            if(!lead.getStatus().equals(LeadStatus.REGISTERED)) {
                log.warn("no registered lead found for the leadId {}", leadId);
                return;
            }
            log.info("syncing lead details from cps for iamUuid {}", leadId);
            ChannelPartnerDto channelPartnerResponse = channelPartnerServiceApiHelper.getByChannelPartnerIamId(leadId);
            if (channelPartnerResponse.getTeamRmMapping() != null && !channelPartnerResponse.getTeamRmMapping().isEmpty()) {
                log.info("syncing assigned sales iamUuid from Cps for lead {} ", leadId);
                String assignedSalesIamUuid = channelPartnerResponse.getTeamRmMapping().get(0).getRmUuid();
                lead.setAssignedSalesIamUuid(assignedSalesIamUuid);
            }
            if(channelPartnerResponse.getIrdaId()!=null && !channelPartnerResponse.getIrdaId().isEmpty()) {
                log.info("syncing irdaId for the lead {}", leadId);
                lead.setIrdaId(channelPartnerResponse.getIrdaId());
            }
            syncLead(lead.getId());
        }catch (Exception e) {
            e.printStackTrace();
            log.error("Error occurred while syncing lead from Cps {}" , e.getMessage());
            throw e;
        }
    }

    @Override
    public void syncLeadFromIAM(String leadId) throws Exception {
        try {
            Lead lead = leadService.fetchLeadByUuid(leadId);
            log.info("syncing lead details from IAM for iamUuid {}", leadId);
            IAMResponseDto.IAMResponse iamResponse = iamServiceApiHelper.validateIamId(
                    lead.getUuid(),
                    Long.valueOf(lead.getTenantId())
            );
            Lead updatedLead = leadBasicDetailsMapper.toEntity(iamResponse);
            updatedLead.addPiiFields();
            log.info("updating mobile {}, email {} in lead {}",
                    iamResponse.getMobile(),
                    iamResponse.getEmail(),
                    lead.getUuid()
            );
            NullAwareBeanUtilsBean.copyNonNullProperties(updatedLead, lead);
            duplicateLeadValidator.validate(lead);
            leadBasicDetailsService.addLeadBasicDetails(lead);
            syncLead(lead.getId());
        }catch (Exception e) {
            e.printStackTrace();
            log.error("Error occurred while syncing lead {} from IAM {}" , leadId, e.getMessage());
            throw e;
        }
    }

    private void syncLead(Long leadId) {
        transactionManager.executeAfterTransactionCommits(() ->leadAsyncService.upsertLeadAsync(leadId));
    }

}
