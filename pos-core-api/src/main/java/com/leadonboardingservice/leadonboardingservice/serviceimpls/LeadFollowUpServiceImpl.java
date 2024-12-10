package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.enums.LeadFollowupStatuses;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadFollowup;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.LeadFollowUpService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class LeadFollowUpServiceImpl implements LeadFollowUpService {

    private final LeadRepository leadRepository;

    @SneakyThrows
    @Override
    public LeadFollowup updateLeadFollowupDetails(String leadId, LeadFollowup leadFollowup) {
        Lead lead = leadRepository.findByUuid(leadId)
                .orElseThrow(() -> new RuntimeException("lead not found with leadId "+leadId));
        leadFollowup.setLead(lead);
        List<LeadFollowup> followups = lead.getLeadFollowups();
        if(followups.isEmpty()){
            followups = new ArrayList<>();
        }
        for (LeadFollowup followup : followups){
            if(!followup.getIsActive()){
                continue;
            }
            if(followup.getStatus().equals(LeadFollowupStatuses.CREATED)){
                /*if(leadFollowup.getStatus().equals(LeadFollowupStatuses.CREATED)){
                    throw new Exception("cannot create another followup while existing is not acknowledged");
                }*/
                followup.setIsActive(false);
                followup.setStatus(LeadFollowupStatuses.ACKNOWLEDGED);
                continue;
            }
            if(followup.getStatus().equals(LeadFollowupStatuses.ACKNOWLEDGED)){
                if(leadFollowup.getStatus().equals(LeadFollowupStatuses.ACKNOWLEDGED)){
                    throw new Exception("Followup already acknowleged");
                }
            }
        }
        if(leadFollowup.getStatus().equals(LeadFollowupStatuses.CREATED)){
            followups.add(leadFollowup);
        }
        lead.setLeadFollowups(followups);
        leadRepository.save(lead);
        return null;
    }
}
