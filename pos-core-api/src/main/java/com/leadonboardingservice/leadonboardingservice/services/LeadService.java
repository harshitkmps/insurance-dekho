package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.models.Lead;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public interface LeadService {
    Lead fetchLeadByUuid(String leadId) throws Exception;

    List<Lead> findByCreatedAtBetween(LocalDate from, LocalDate to);

    List<Lead> findAllById(List<Long> ids);
}
