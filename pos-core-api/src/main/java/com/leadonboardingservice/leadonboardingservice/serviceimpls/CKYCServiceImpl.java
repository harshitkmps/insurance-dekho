package com.leadonboardingservice.leadonboardingservice.serviceimpls;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.constants.OnboardingConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.request.CKYCDownloadRequest;
import com.leadonboardingservice.leadonboardingservice.dtos.request.CKYCSearchRequest;
import com.leadonboardingservice.leadonboardingservice.dtos.response.CKYCSearchResponse;
import com.leadonboardingservice.leadonboardingservice.enums.AddressTypes;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentSources;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentStatus;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import com.leadonboardingservice.leadonboardingservice.externals.BrokerageMasterApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.BrokerageAreaResponseDto;
import com.leadonboardingservice.leadonboardingservice.models.*;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.CKYCService;
import com.leadonboardingservice.leadonboardingservice.services.LeadAdditionalDetailsService;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.TrackWizzServiceApiHelper;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
@Slf4j
public class CKYCServiceImpl implements CKYCService {

    private final TrackWizzServiceApiHelper trackWizzService;
    private final LeadRepository leadRepository;
    private final BrokerageMasterApiHelper brokerageMasterApiHelper;
    private final LeadAdditionalDetailsService leadAdditionalDetailsService;

    @Transactional
    @Override
    public Lead updateLeadKyc(String leadId, String pan, String dateOfBirth) {
        try {
            Lead lead = leadRepository.findByUuid(leadId)
                    .orElseThrow(() -> new RuntimeException("lead not found with leadId " + leadId));
            log.info("initiated kyc for leadId {} pan {} dob {}",leadId,pan,dateOfBirth);
            JsonNode cKYCResponse = fetchCKYCDetails(pan, dateOfBirth, leadId);
            updateDocuments(lead, cKYCResponse);
            updateBasicDetails(lead,cKYCResponse);
            leadRepository.save(lead);
            return lead;
        }catch (Exception e){
            e.printStackTrace();
            log.error("error occurred while fetching ckyc details for leadId {}. Error: {} ",leadId,e.getMessage());
            return leadRepository.findByUuid(leadId)
                    .orElseThrow(() -> new RuntimeException("lead not found with leadId " + leadId));
        }
    }

    private void updateBasicDetails(Lead lead, JsonNode cKYCResponse) {
        log.info("updating ckyc basic details for lead {}",lead.getUuid());
        try {
            String fullName = cKYCResponse.get("CKYCFullName").asText();
            String fullAddress = cKYCResponse.get("CKYCPerAdd1").asText() +
                    cKYCResponse.get("CKYCPerAdd2").asText() +
                    cKYCResponse.get("CKYCPerAdd3").asText();
            String pinCode = cKYCResponse.get("CKYCPerAddPin").asText();
            String gender = cKYCResponse.get("CKYCGender").asText();
            BrokerageAreaResponseDto.BrokerageAreaDto brokerageAreaDto = brokerageMasterApiHelper.getAreaDetailsByPinCode(pinCode);
            Integer cityId = brokerageAreaDto.getCityId();
            Integer stateId = brokerageAreaDto.getStateId();
            List<LeadAdditionalDetails> leadAdditionalDetailsList = new ArrayList<>();
            if (!StringUtils.isEmpty(fullName)) {
                leadAdditionalDetailsList.add(new LeadAdditionalDetails(LeadConstants.NAME_FROM_AADHAAR, fullName));
            }
            if (!StringUtils.isEmpty(gender)) {
                leadAdditionalDetailsList.add(new LeadAdditionalDetails(LeadConstants.GENDER, gender));
            }
            if (!leadAdditionalDetailsList.isEmpty()) {
                leadAdditionalDetailsService.addDetails(lead.getUuid(), leadAdditionalDetailsList);
            }
            List<Address> addressList = lead.getAddress();
            if(addressList == null) {
                addressList = new ArrayList<>();
            }
            Optional<Address> optionalAddress = addressList.stream().filter(x -> x.getType().equals(AddressTypes.HOME)).findFirst();
            Address address = optionalAddress.orElseGet(Address::new);
            address.setType(AddressTypes.HOME);
            address.setAddress(fullAddress);
            address.setPincode(pinCode);
            address.setCityId(cityId);
            address.setStateId(stateId);
            if(optionalAddress.isEmpty()) {
                address.setLead(lead);
                addressList.add(address);
                lead.setAddress(addressList);
            }
        }catch (Exception e){
            e.printStackTrace();
            log.error("error while updating ckyc leads basic details for lead {}. Error {}",lead.getUuid(),e.getMessage());
        }
    }

    private void updateDocuments(Lead lead, JsonNode cKYCResponse) {
        List<Document> existingDocumentList = lead.getDocuments();
        if(existingDocumentList == null){
            existingDocumentList = new ArrayList<>();
        }
        ArrayNode imageDataList = (ArrayNode) cKYCResponse.get("CKYCImageDetails").get("CKYCImageDetails");
        List<Document> finalExistingDocumentList = existingDocumentList;
        List<Document> leadDocuments = new ArrayList<>();
        for (JsonNode imageData : imageDataList) {
            log.info("adding image {} for lead {}",imageData.get("CKYCImageType").asText(),lead.getUuid());
            try {
                DocumentType documentType = getDocumentType(imageData.get("CKYCImageType").asText());
                String documentId = imageData.get("documentId").asText();
                if(documentType.equals(DocumentType.AADHAAR_FRONT)){
                    leadDocuments.add(createDocument(lead,DocumentType.AADHAAR_BACK,documentId));
                }
                leadDocuments.add(createDocument(lead, documentType, documentId));
            }catch (Exception e){
                e.printStackTrace();
                log.error("error while adding documents from kyc service for lead {}. Error {}",lead.getUuid(),e.getMessage());
            }
        }
        String pinCode = cKYCResponse.get("CKYCPerAddPin").asText();
        if(!pinCode.isEmpty()){
            Optional<Document> optionalAadhaar = leadDocuments.stream()
                    .filter(x -> x.getType().equals(DocumentType.AADHAAR_FRONT))
                    .findFirst();
            if (optionalAadhaar.isEmpty()) {
                leadDocuments.add(createDocument(lead, DocumentType.AADHAAR_FRONT, null));
                leadDocuments.add(createDocument(lead, DocumentType.AADHAAR_BACK, null));
            }
        }
        leadDocuments.forEach(document -> {
            Optional<Document> optionalDocument = finalExistingDocumentList.stream()
                    .filter(x -> x.getType().equals(document.getType()))
                    .findFirst();
            optionalDocument.ifPresent(x -> x.setIsDeleted(true));
            finalExistingDocumentList.add(document);
        });
        List<Document> nonDeletedDocuments = finalExistingDocumentList.stream()
                .filter(doc -> !doc.getIsDeleted())
                .collect(Collectors.toList());
        lead.setDocuments(nonDeletedDocuments);
    }

    @SneakyThrows
    @Override
    public CKYCSearchResponse searchCKYC(CKYCSearchRequest searchRequest) {
        ObjectNode response = trackWizzService.searchCKYCDetailsV2(searchRequest);
        if(!response.get("statusCode").asText().equalsIgnoreCase("200")){
            return new CKYCSearchResponse();
        }
        JsonNode responseModel = response.get("data");
        return CKYCSearchResponse.builder()
                .cKYCId(String.valueOf((long) responseModel.get("cKYCId").asLong()))
                .cKYCAge(responseModel.get("cKYCAge").asInt())
                .cKYCStatus(responseModel.get("cKYCStatus").asText())
                .cKYCAvailable(responseModel.get("cKYCAvailable").asText())
                .cKYCFatherName(responseModel.get("cKYCFatherName").asText())
                .cKYCAccType(responseModel.get("cKYCAccType").asText())
                .requestId(responseModel.get("requestId").asText())
                .cKYCName(responseModel.get("cKYCName").asText())
                .build();
    }

    private Document createDocument(Lead lead, DocumentType documentType, String documentId) {
        return Document
                .builder()
                .documentId(documentId)
                .status(DocumentStatus.UPLOADED)
                .source(DocumentSources.AUTOMATED)
                .type(documentType)
                .verifiedAt(LocalDateTime.now())
                .lead(lead)
                .isReUploaded(false)
                .origin(OnboardingConstants.CKYC)
                .build();
    }

    private DocumentType getDocumentType(String ckycImageType) {
        if(ckycImageType.equalsIgnoreCase("PAN")){
            return DocumentType.PAN;
        }
        if(ckycImageType.equalsIgnoreCase("AadhaarOffline") ||
                ckycImageType.equalsIgnoreCase("AadharCard")){
            return DocumentType.AADHAAR_FRONT;
        }
        if(ckycImageType.equalsIgnoreCase("Photograph")){
            return DocumentType.USER_PHOTO;
        }
        throw new RuntimeException("unknown document type "+ ckycImageType);
    }

    public ObjectNode fetchCKYCDetails(String pan, String dateOfBirth, String leadId) throws Exception {
        log.info("fetching CKYC details for pan {} and dob {} ",pan,dateOfBirth);
        CKYCSearchRequest ckycSearchRequest = new CKYCSearchRequest();
        ckycSearchRequest.setInputId(pan);
        ckycSearchRequest.setInputType(CKYCSearchRequest.InputType.PAN);
        ckycSearchRequest.setUuid(leadId);
        ObjectNode response = trackWizzService.searchCKYCDetailsV2(ckycSearchRequest);
        if(!response.get("statusCode").asText().equalsIgnoreCase("200")){
            throw new Exception("Search Rejected By TrackWizz");
        }
        JsonNode searchResponse = response.get("data");
        if(searchResponse != null
                && searchResponse.get("cKYCStatus").asText().equalsIgnoreCase("CKYCSuccess")
                && searchResponse.get("cKYCId").asLong() != 0 ){
            CKYCDownloadRequest ckycDownloadRequest = new CKYCDownloadRequest(
                    String.valueOf(searchResponse.get("cKYCId").asLong()),
                    dateOfBirth,
                    leadId
            );
            ObjectNode kycDownloadResponse = trackWizzService.downLoadCKYCDetailsV2(ckycDownloadRequest);
            if(kycDownloadResponse.get("data") == null || !kycDownloadResponse.get("statusCode").asText().equalsIgnoreCase("200")) {
                throw new Exception("download rejected");
            }
            ObjectNode downloadResponse = (ObjectNode) kycDownloadResponse.get("data");
            if(downloadResponse != null
                    && downloadResponse.get("CKYCStatus").asText().equalsIgnoreCase("CKYCSuccess")){
                return downloadResponse;
            }
            throw new Exception("Download Rejected By TrackWizz");
        }
        throw new Exception("Search Rejected By TrackWizz");
    }
}
