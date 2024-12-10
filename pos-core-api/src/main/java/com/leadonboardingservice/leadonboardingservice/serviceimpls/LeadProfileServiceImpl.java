package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.helpers.NullAwareBeanUtilsBean;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadProfile;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadProfileRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.LeadProfileService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class LeadProfileServiceImpl implements LeadProfileService {

    private final LeadProfileRepository leadProfileRepository;
    private final LeadRepository leadRepository;

    @SneakyThrows
    @Override
    public LeadProfile updateLeadProfile(String leadId, LeadProfile leadProfile) {
        Lead lead = leadRepository.findByUuid(leadId)
                .orElseThrow(() -> new RuntimeException("lead not found with leadId "+leadId));
        leadProfile.setLead(lead);
        LeadProfile existingLeadProfile = lead.getLeadProfile();
        if(existingLeadProfile == null){
            existingLeadProfile = leadProfile;
        }
        NullAwareBeanUtilsBean.copyNonNullProperties(leadProfile,existingLeadProfile);
        leadProfileRepository.save(existingLeadProfile);
        lead.setLeadProfile(existingLeadProfile);
        lead.setStatus(LeadStatus.CREATED);
        leadRepository.save(lead);
        return existingLeadProfile;
    }

}

