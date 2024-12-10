package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.LeadBasicDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeadBasicDetailsServiceImpl implements LeadBasicDetailsService {

    private final LeadRepository leadRepository;

    @Override
    public Lead addLeadBasicDetails(Lead lead) {
        return leadRepository.save(lead);
    }
}
