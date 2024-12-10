package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.constants.OnboardingConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.request.ValidateAadhaarOtpRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.OtpRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.*;
import com.leadonboardingservice.leadonboardingservice.enums.AddressTypes;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentSources;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentStatus;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import com.leadonboardingservice.leadonboardingservice.externals.BrokerageMasterApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.BrokerageAreaResponseDto;
import com.leadonboardingservice.leadonboardingservice.models.*;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.LeadAdditionalDetailsService;
import com.leadonboardingservice.leadonboardingservice.services.AadhaarService;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.TrackWizzServiceApiHelper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
@Slf4j
@Transactional
public class AadhaarServiceImpl implements AadhaarService {

    private final TrackWizzServiceApiHelper trackWizzService;
    private final LeadRepository leadRepository;
    private final BrokerageMasterApiHelper brokerageMasterApiHelper;
    private final LeadAdditionalDetailsService leadAdditionalDetailsService;

    @Override
    public AadhaarOtpResponseData sendAadhaarOtp(OtpRequestDto otpRequestDto) throws Exception{
        AadhaarOtpResponse response =  trackWizzService.sendAadhaarOtp(otpRequestDto);
        return response.getData();
    }

    @Override
    public Lead fetchLeadAadhaarDetails(String leadId, ValidateAadhaarOtpRequestDto request) throws Exception{
        Lead lead = leadRepository.findByUuid(leadId)
                .orElseThrow(() -> new RuntimeException("lead not found with leadId " + leadId));
        log.info("fetching aadhaar details for leadId {} aadhaarRequestId {} ",leadId,request.requestId);
        AadhaarDetailsResponse aadhaarDetailsResponse = trackWizzService.validateAadhaarOtp(request);
        updateLeadAddress(lead, aadhaarDetailsResponse.getData());
        updateDocuments(lead,aadhaarDetailsResponse.getData());
        updateAdditionalDetails(leadId, aadhaarDetailsResponse.getData());
        updateLeadProfile(lead, aadhaarDetailsResponse.getData());
        leadRepository.save(lead);
        return lead;
    }

    private void updateLeadProfile(Lead lead, AadhaarResponseData data) {
        if(!StringUtils.isEmpty(data.getDob())) {
            LeadProfile leadProfile = lead.getLeadProfile();
            leadProfile.setDateOfBirth(LocalDate.parse(data.getDob()));
        }
    }

    private void updateAdditionalDetails(String leadId, AadhaarResponseData data) {
        String leadGender =  data.getGender();
        String leadName = data.getName();
        List<LeadAdditionalDetails> leadAdditionalDetailsList = new ArrayList<>();
        if(!StringUtils.isEmpty(leadGender)) {
            leadAdditionalDetailsList.add(new LeadAdditionalDetails(LeadConstants.GENDER, leadGender));
        }
        if(!StringUtils.isEmpty(leadName)) {
            leadAdditionalDetailsList.add(new LeadAdditionalDetails(LeadConstants.NAME_FROM_AADHAAR, leadName));
        }
        if(!leadAdditionalDetailsList.isEmpty()) {
            leadAdditionalDetailsService.addDetails(leadId, leadAdditionalDetailsList);
        }
    }

    private Document createDocument(Lead lead, DocumentType type, String documentId) {
        return Document
                .builder()
                .documentId(documentId)
                .status(DocumentStatus.UPLOADED)
                .source(DocumentSources.AUTOMATED)
                .type(type)
                .verifiedAt(LocalDateTime.now())
                .lead(lead)
                .isReUploaded(false)
                .origin(OnboardingConstants.UIDAI)
                .build();
    }

    private void updateDocuments(Lead lead, AadhaarResponseData data){
        List<Document> existingDocumentList = lead.getDocuments();
        if(existingDocumentList == null){
            existingDocumentList = new ArrayList<>();
        }
        List<Document> finalExistingDocumentList = existingDocumentList;
        List<Document> leadDocuments = new ArrayList<>();
        if(data.getProfileDocumentId()!=null && !data.getProfileDocumentId().isEmpty()) {
            log.info("updating profile image from aadhaar for lead {}", lead.getUuid());
            leadDocuments.add(createDocument(lead,DocumentType.USER_PHOTO,data.getProfileDocumentId()));
        }
        if(data.getPincode()!=null) {
            log.info("updating address documents from aadhaar for lead {}", lead.getUuid());
            leadDocuments.add(createDocument(lead, DocumentType.AADHAAR_FRONT, null));
            leadDocuments.add(createDocument(lead, DocumentType.AADHAAR_BACK, null));
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

    private void updateLeadAddress(Lead lead, AadhaarResponseData aadhaarData) {
        log.info("updating address details from aadhaar for lead {}", lead.getUuid());
        try {
            String fullAddress = constructFullAddress(aadhaarData);
            String pinCode = aadhaarData.getPincode();
            String locality = aadhaarData.getLocality();
            BrokerageAreaResponseDto.BrokerageAreaDto brokerageAreaDto = brokerageMasterApiHelper.getAreaDetailsByPinCode(pinCode);
            Integer cityId = brokerageAreaDto.getCityId();
            Integer stateId = brokerageAreaDto.getStateId();

            List<Address> addressList = lead.getAddress();
            if (addressList == null) {
                addressList = new ArrayList<>();
            }
            Optional<Address> optionalAddress = addressList.stream().filter(x -> x.getType().equals(AddressTypes.HOME)).findFirst();
            Address leadAddress = optionalAddress.orElseGet(Address::new);
            leadAddress.setType(AddressTypes.HOME);
            leadAddress.setAddress(fullAddress);
            leadAddress.setPincode(pinCode);
            leadAddress.setLocality(locality);
            leadAddress.setCityId(cityId);
            leadAddress.setStateId(stateId);
            if (optionalAddress.isEmpty()) {
                leadAddress.setLead(lead);
                addressList.add(leadAddress);
                lead.setAddress(addressList);
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("error while updating address details from aadhaar for lead {}. Error {}", lead.getUuid(), e.getMessage());
        }
    }

    private String constructFullAddress(AadhaarResponseData address) {
        if (address != null) {
            return String.join(" ",
                    address.getHouse(),
                    address.getLandmark(),
                    address.getStreet(),
                    address.getSubDistrict(),
                    address.getVtc(),
                    address.getPostOffice(),
                    address.getDistrict(),
                    address.getState(),
                    address.getCountry()
            );
        } else {
            return "";
        }
    }

}
