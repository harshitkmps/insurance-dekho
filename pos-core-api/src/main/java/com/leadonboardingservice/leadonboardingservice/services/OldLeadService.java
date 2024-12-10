package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLead;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface OldLeadService {

    List<OldLead> findByCreatedAtBetween(@Param("from") LocalDate from , @Param("to") LocalDate to );
    List<OldLead> findAllById(List<Long> ids);
}
