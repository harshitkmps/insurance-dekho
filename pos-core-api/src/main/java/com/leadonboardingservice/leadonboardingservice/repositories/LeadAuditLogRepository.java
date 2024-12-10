package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.LeadAuditLog;
import org.springframework.data.repository.CrudRepository;

public interface LeadAuditLogRepository extends CrudRepository<LeadAuditLog,Long> {
}
