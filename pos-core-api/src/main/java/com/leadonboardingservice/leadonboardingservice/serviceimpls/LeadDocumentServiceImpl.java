package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentSources;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentStatus;
import com.leadonboardingservice.leadonboardingservice.enums.LeadTrigger;
import com.leadonboardingservice.leadonboardingservice.exceptions.ValidationException;
import com.leadonboardingservice.leadonboardingservice.helpers.NullAwareBeanUtilsBean;
import com.leadonboardingservice.leadonboardingservice.models.Document;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadDocumentRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.LeadDocumentsService;
import com.leadonboardingservice.leadonboardingservice.services.LeadEventService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Slf4j
public class LeadDocumentServiceImpl implements LeadDocumentsService {

    private final LeadRepository leadRepository;
    private final LeadEventService leadEventService;
    private final LeadDocumentRepository leadDocumentRepository;

    @Override
    public Document addLeadDocument(String leadId, Document newLeadDocument) {
        Lead lead = leadRepository.findByUuid(leadId)
                .orElseThrow(() -> new RuntimeException("lead not found with leadId "+leadId));
        newLeadDocument.setLead(lead);
        List<Document> documents = leadDocumentRepository.findByLeadId(lead.getId());
        if(documents.isEmpty()){
            documents = new ArrayList<>();
        }
        Optional<Document> existingDocument = documents.stream()
                .filter(x -> x.getType() != null && x.getType().equals(newLeadDocument.getType()))
                .findFirst();
        if(existingDocument.isPresent()){
            if(!StringUtils.isEmpty(newLeadDocument.getDocumentId())
                    && (existingDocument.get().getStatus().equals(DocumentStatus.REJECTED) || existingDocument.get().getIsReUploaded())){
                newLeadDocument.setIsReUploaded(true);
            }
            NullAwareBeanUtilsBean.copyNonNullProperties(newLeadDocument,existingDocument.get());
            if(!existingDocument.get().getStatus().equals(DocumentStatus.REJECTED)){
                existingDocument.get().setRejectStatusRemarkId(null);
            }
            DocumentSources sources = existingDocument.get().getSource();
            if(sources.equals(DocumentSources.AUTOMATED) ||
                    sources.equals(DocumentSources.KYC_RE_UPLOADED)){
                newLeadDocument.setSource(DocumentSources.KYC_RE_UPLOADED);
            }
            if(newLeadDocument.getSource().equals(DocumentSources.MANUAL)){
                existingDocument.get().setOrigin(null);
            }
            leadDocumentRepository.save(existingDocument.get());
        }else {
            newLeadDocument.setIsReUploaded(false);
            documents.add(newLeadDocument);
        }
        leadDocumentRepository.saveAll(documents);
        updateLeadEvent(leadId,documents);
        return newLeadDocument;
    }

    private void updateLeadEvent(String leadId, List<Document> leadDocumentList) {
        try {
            if(leadDocumentList.stream().anyMatch(x -> x.getStatus().equals(DocumentStatus.REJECTED))){
                leadEventService.triggerEvent(new LeadStatusEventRequestDto(leadId, LeadTrigger.DOCUMENTS_REUPLOAD, new HashMap<>()));
            }
            if(leadDocumentList.stream().noneMatch(x -> x.getStatus().equals(DocumentStatus.REJECTED))){
                leadEventService.triggerEvent(new LeadStatusEventRequestDto(leadId, LeadTrigger.REQUEST_FOR_REGISTRATION, new HashMap<>()));
            }
        }catch (ValidationException e){
            e.printStackTrace();
        }
    }
}
