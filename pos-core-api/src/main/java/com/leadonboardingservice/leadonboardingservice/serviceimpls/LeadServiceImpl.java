package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.exceptions.ResourceNotFoundException;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.LeadService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@AllArgsConstructor
public class LeadServiceImpl implements LeadService {

    private final LeadRepository leadRepository;

    public Lead fetchLeadByUuid(String leadId) throws Exception{
        log.info("getting details for lead {}",leadId);
        Optional<Lead> fetchedLead = leadRepository.findByUuid(leadId);
        if(fetchedLead.isEmpty()){
            throw new ResourceNotFoundException("lead with given id not found");
        }
        return fetchedLead.get();
    }

    @Override
    public List<Lead> findByCreatedAtBetween(LocalDate from, LocalDate to) {
        log.info("finding leads from {} and to {}",from,to);
        return leadRepository.findByCreatedAtBetween(from.atStartOfDay(),to.atStartOfDay());
    }

    @Override
    public List<Lead> findAllById(List<Long> ids) {
        log.info("finding leads by ids {}",ids);
        return leadRepository.findByIdIn(ids);
    }

}
