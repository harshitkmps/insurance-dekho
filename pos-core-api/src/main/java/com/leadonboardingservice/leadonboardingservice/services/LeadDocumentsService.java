package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.models.Document;

public interface LeadDocumentsService {
    Document addLeadDocument(String leadUUID, Document document);
}
