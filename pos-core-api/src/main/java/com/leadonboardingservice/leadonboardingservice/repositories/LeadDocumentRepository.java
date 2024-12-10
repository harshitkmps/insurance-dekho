package com.leadonboardingservice.leadonboardingservice.repositories;

import com.leadonboardingservice.leadonboardingservice.models.Document;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface LeadDocumentRepository extends CrudRepository<Document, Long> {
    List<Document> findByLeadId(Long leadId);
}
