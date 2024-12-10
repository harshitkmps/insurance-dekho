package com.leadonboardingservice.leadonboardingservice.repositories.oldleadrepository;

import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLeadDoc;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface OldLeadDocumentRepository extends CrudRepository<OldLeadDoc,Long> {
    List<OldLeadDoc> findByLeadId(Long id);
}
