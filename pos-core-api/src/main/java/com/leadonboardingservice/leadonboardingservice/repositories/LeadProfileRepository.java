package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.LeadProfile;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface LeadProfileRepository extends CrudRepository<LeadProfile, Long> {
    List<LeadProfile> findByPanHashed(String panHashed);
}
