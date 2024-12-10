package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadAdditionalDetails;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadAdditionalDetailsRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.LeadAdditionalDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeadAdditionalDetailsServiceImpl implements LeadAdditionalDetailsService {
    private final LeadAdditionalDetailsRepository leadAdditionalDetailsRepository;
    private final LeadRepository leadRepository;
    @Override
    public List<LeadAdditionalDetails> addDetails(String leadId, List<LeadAdditionalDetails> leadAdditionalDetails) {
        Lead lead = leadRepository.findByUuid(leadId)
                .orElseThrow(() -> new RuntimeException("lead not found with leadId "+leadId));
        List<LeadAdditionalDetails> existingDetails = leadAdditionalDetailsRepository.findByLeadId(lead.getId());
        leadAdditionalDetails.forEach(additionalDetail -> {
            Optional<LeadAdditionalDetails> existingDetail = existingDetails.stream()
                    .filter(x -> x.getPropertyName().equalsIgnoreCase(additionalDetail.getPropertyName()))
                    .findFirst();
            if(existingDetail.isPresent()){
                existingDetail.get().setPropertyName(additionalDetail.getPropertyName());
                existingDetail.get().setPropertyValue(additionalDetail.getPropertyValue());
                return;
            }
            additionalDetail.setLead(lead);
            existingDetails.add(additionalDetail);
        });
        leadAdditionalDetailsRepository.saveAll(existingDetails);
        return existingDetails;
    }

    @Override
    public List<LeadAdditionalDetails> findDetails(String leadId, List<LeadAdditionalDetails> leadAdditionalDetails) {
        Lead lead = leadRepository.findByUuid(leadId)
                .orElseThrow(() -> new RuntimeException("lead not found with leadId "+leadId));
        List<LeadAdditionalDetails> existingDetails = leadAdditionalDetailsRepository.findByLeadId(lead.getId());
        List<LeadAdditionalDetails> filteredDetails;
        filteredDetails = existingDetails.stream()
                .filter(detail -> leadAdditionalDetails.stream()
                        .anyMatch(requestDetail -> requestDetail.getPropertyName()
                                .equalsIgnoreCase(detail.getPropertyName())))
                .collect(Collectors.toList());
        return filteredDetails;
    }
}
