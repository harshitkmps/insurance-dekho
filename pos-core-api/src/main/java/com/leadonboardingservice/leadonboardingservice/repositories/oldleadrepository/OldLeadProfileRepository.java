package com.leadonboardingservice.leadonboardingservice.repositories.oldleadrepository;

import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLeadProfile;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface OldLeadProfileRepository extends CrudRepository<OldLeadProfile,Long> {
    Optional<OldLeadProfile> findByLeadToken(String token);
}
