package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLeadTraining;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface AgentLeadRegRepository extends CrudRepository<OldLeadTraining,Long> {

    List<OldLeadTraining> findByLeadToken(String token);
}
