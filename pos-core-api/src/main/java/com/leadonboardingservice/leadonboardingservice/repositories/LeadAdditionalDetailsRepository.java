package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.LeadAdditionalDetails;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface LeadAdditionalDetailsRepository extends CrudRepository<LeadAdditionalDetails,Long> {
    List<LeadAdditionalDetails> findByLeadId(Long leadId);
}
