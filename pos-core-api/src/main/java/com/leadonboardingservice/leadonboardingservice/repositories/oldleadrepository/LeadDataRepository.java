package com.leadonboardingservice.leadonboardingservice.repositories.oldleadrepository;

import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLead;
import org.springframework.data.repository.CrudRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface LeadDataRepository extends CrudRepository<OldLead,Long> {

        List<OldLead> findByCreatedAtBetweenAndIsMigrate(LocalDateTime from ,LocalDateTime to,Integer isMigrate);
        List<OldLead> findByIdIn(List<Long> ids);


}
