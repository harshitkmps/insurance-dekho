package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.constants.OnboardingConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.response.PanValidationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.PanVerificationResponse;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentSources;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentStatus;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.exceptions.InvalidRequestException;
import com.leadonboardingservice.leadonboardingservice.helpers.HashGenerator;
import com.leadonboardingservice.leadonboardingservice.models.*;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.LeadReRegisterService;
import com.leadonboardingservice.leadonboardingservice.services.PanVerificationAdapterService;
import com.leadonboardingservice.leadonboardingservice.services.PanVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PanVerificationServiceImpl implements PanVerificationService {
    private final LeadRepository leadRepository;
    private final PanVerificationAdapterService panVerificationAdapterService;
    private final HashGenerator hashGenerator;
    private final LeadReRegisterService leadReRegisterService;

    @Override
    public Lead updatePanDetails(String leadId, String panNumber) throws Exception {
        Lead lead = leadRepository.findByUuid(leadId)
                .orElseThrow(() -> new RuntimeException("lead not found with leadId " + leadId));
        if(StringUtils.isEmpty(panNumber) || lead.getStatus().equals(LeadStatus.REGISTERED)) { return lead; }
        String panHashed = hashGenerator.generate(panNumber);
        LeadProfile leadProfile = lead.getLeadProfile();
        if(leadProfile!=null && panHashed.equals(leadProfile.getPanHashed())) {
            log.info("existing pan entered by the lead {}", leadId);
            return lead;
        }
        PanValidationRequestDto panValidationRequestDto = PanValidationRequestDto.builder().pan(panNumber).uuid(leadId).build();
        log.info("verifying pan details for the leadId {}", leadId);
        PanVerificationResponse panVerificationResponse = panVerificationAdapterService.verifyPan(panValidationRequestDto);
        if(!panVerificationResponse.isPanValid()) {
            throw new InvalidRequestException("Pan number could not be verified, Current pan status " + panVerificationResponse.getPanStatus());
        }
        if (shouldClearForRejection(lead) || shouldClearForReRegister(lead)) {
            clearLeadDetails(lead);
        }
        leadReRegisterService.updateNocStatus(leadId,"0");
        lead.setName(panVerificationResponse.getName());
        addLeadDocuments(lead);
        leadRepository.save(lead);
        return lead;
    }

    private boolean shouldClearForRejection(Lead lead) {
        return LeadStatus.REJECTED.equals(lead.getStatus()) &&
                LeadConstants.RejectionRemarkId.PAN_REGISTERED_WITH_IRDAI.equals(lead.getRejectionRemarksId());
    }

    private boolean shouldClearForReRegister(Lead lead) {
        Optional<LeadAdditionalDetails> reRegisterDetail = lead.getLeadAdditionalDetails().stream()
                .filter(x -> x.getPropertyName().equals(LeadConstants.RE_REGISTER) && "1".equals(x.getPropertyValue()))
                .findFirst();
        Optional<LeadAdditionalDetails> nocReqDetail = lead.getLeadAdditionalDetails().stream()
                .filter(x -> x.getPropertyName().equals(LeadConstants.NOC_REQ) && "1".equals(x.getPropertyValue()))
                .findFirst();
        return reRegisterDetail.isPresent() && nocReqDetail.isPresent();
    }

    private void addLeadDocuments(Lead lead) {
        List<Document> existingDocumentList = lead.getDocuments();
        if(existingDocumentList == null){
            existingDocumentList = new ArrayList<>();
        }
        List<Document> finalExistingDocumentList = existingDocumentList;
        Document panDocument = Document.builder()
                .status(DocumentStatus.UPLOADED)
                .source(DocumentSources.AUTOMATED)
                .type(DocumentType.PAN)
                .verifiedAt(LocalDateTime.now())
                .isReUploaded(false)
                .origin(OnboardingConstants.SIGNZY)
                .lead(lead)
                .build();
        Optional<Document> optionalDocument = finalExistingDocumentList.stream()
                .filter(x -> x.getType().equals(panDocument.getType()))
                .findFirst();
        optionalDocument.ifPresent(document -> document.setIsDeleted(true));
        finalExistingDocumentList.add(panDocument);
        lead.setDocuments(finalExistingDocumentList);
    }

    private void clearLeadDetails(Lead lead) {
        log.info("clearing lead old documents and bank info for lead {}", lead.getId());
        Optional.ofNullable(lead.getDocuments()).ifPresent(documents -> documents.forEach(document -> document.setIsDeleted(true)));
        Optional.ofNullable(lead.getBankDetails()).ifPresent(bankDetails -> bankDetails.forEach(BankDetail::clearBankDetails));
        Optional.ofNullable(lead.getLeadProfile()).ifPresent(profile -> profile.setEducationDetails(null));
        Optional.ofNullable(lead.getAddress()).ifPresent(addresses -> addresses.forEach(address -> address.setIsDeleted(true)));
        Optional.ofNullable(lead.getLeadTrainings()).ifPresent(trainings -> trainings.forEach(training -> training.setIsDeleted(true)));

        List<Document> nonDeletedDocuments = new ArrayList<>();
        lead.setDocuments(nonDeletedDocuments);
        List<Address> nonDeletedAddresses = new ArrayList<>();
        lead.setAddress(nonDeletedAddresses);
        lead.setStatus(LeadStatus.CREATED);
        leadRepository.save(lead);
    }
}
