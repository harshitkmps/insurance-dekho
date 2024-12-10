package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLead;
import com.leadonboardingservice.leadonboardingservice.repositories.oldleadrepository.LeadDataRepository;
import com.leadonboardingservice.leadonboardingservice.services.OldLeadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OldLeadServiceImpl implements OldLeadService {
    private final LeadDataRepository leadDataRepository;

    @Override
    public List<OldLead> findByCreatedAtBetween(LocalDate from, LocalDate to) {
        log.info("finding old lead from {} and to {}",from,to);
        return leadDataRepository.findByCreatedAtBetweenAndIsMigrate(from.atStartOfDay(),to.atStartOfDay(),1);
    }

    @Override
    public List<OldLead> findAllById(List<Long> ids) {
        log.info("finding old leads by ids {}",ids);
        return leadDataRepository.findByIdIn(ids);
    }
}
