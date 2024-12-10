package com.leadonboardingservice.leadonboardingservice.validators;

import com.leadonboardingservice.leadonboardingservice.constants.ErrorMessageConstants;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.response.BankVerificationResponseDto;
import com.leadonboardingservice.leadonboardingservice.enums.AddressTypes;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentStatus;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.models.*;
import com.leadonboardingservice.leadonboardingservice.services.BankVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class LeadStatusValidator implements ConvertLeadValidator{
    private final BankVerificationService bankVerificationService;

    @Transactional
    public Optional<String> isReadyToMoveToQC(Lead lead){
        log.info("checking whether lead isReadyToMoveToQC for lead {}",lead.getId());
        StringBuilder errorMessage = new StringBuilder();
        try{
            if(lead.getId() == null){
                errorMessage.append(ErrorMessageConstants.EMPTY_LEAD_ID);
                return Optional.of(errorMessage.toString());
            }

            // check if lead has mobile and email
            if(lead.getMobileEncrypted().isEmpty() || lead.getEmailEncrypted().isEmpty()){
                log.info("mobile empty for lead {}",lead.getId());
                errorMessage.append(ErrorMessageConstants.EMPTY_MOBILE);
                return Optional.of(errorMessage.toString());
            }

            // check if bank details are present and verified
            List<BankDetail> bankDetailList = lead.getBankDetails();
            if(bankDetailList == null || bankDetailList.size() == 0){
                log.info("bank details not found for lead {}",lead.getId());
                errorMessage.append(ErrorMessageConstants.EMPTY_BANK_DETAILS);
                return Optional.of(errorMessage.toString());
            }
            for(BankDetail bankDetail: bankDetailList){
                if(!bankDetail.getIsBankVerified()){
                    BankVerificationResponseDto bankVerificationResponse = bankVerificationService.verifyAccount(lead.getUuid());
                    if(!bankVerificationResponse.isBankVerified()){
                        log.info("bank not verified for lead {}",lead.getId());
                        errorMessage.append(bankVerificationResponse.getMessage());
                        return Optional.of(errorMessage.toString());
                    }
                }
            }

            // check if pan value is there
            LeadProfile leadProfile = lead.getLeadProfile();
            if(leadProfile == null){
                log.info("lead profile empty for lead {}",lead.getId());
                errorMessage.append(ErrorMessageConstants.EMPTY_LEAD_PROFILE);
                return Optional.of(errorMessage.toString());
            }
            if(leadProfile.getEducationDetails() == null){
                log.info("educational details empty for lead {}",lead.getId());
                errorMessage.append(ErrorMessageConstants.EMPTY_EDUCATION_DETAILS);
                return Optional.of(errorMessage.toString());
            }
            if(leadProfile.getPanEncrypted() ==null || leadProfile.getPanEncrypted().isEmpty() || leadProfile.getEducationDetails().isEmpty()){
                log.info("pan empty for lead {}",lead.getId());
                errorMessage.append(ErrorMessageConstants.EMPTY_PAN);
                return Optional.of(errorMessage.toString());
            }
            // introduce dob check as well?

            //checking re-registration checks
            Map<String, String> leadDetailsMap = lead.getLeadAdditionalDetails()
                    .stream()
                    .collect(Collectors.toMap(LeadAdditionalDetails::getPropertyName, LeadAdditionalDetails::getPropertyValue,(oldkey,newkey) -> {
                        log.info("Duplicate key found in additional details ");
                        return newkey;
                    }));
            String migrationDetails = leadDetailsMap.get(LeadConstants.RE_REGISTER);
            String nocDetails = leadDetailsMap.get(LeadConstants.NOC_REQ);
            if(migrationDetails!=null && migrationDetails.equals("1") && nocDetails==null) {
                log.info("noc details are empty for re-registered lead {}",lead.getId());
                errorMessage.append(ErrorMessageConstants.EMPTY_NOC_DETAILS);
                return Optional.of(errorMessage.toString());
            }

            if(nocDetails!=null && nocDetails.equals("0")) {
                String existingPanHashed = leadDetailsMap.get(LeadConstants.OLD_PAN);
                String panHashed = leadProfile.getPanHashed();
                if(existingPanHashed!=null && existingPanHashed.equals(panHashed)) {
                    log.info("new pan details not found for lead {}",lead.getId());
                    errorMessage.append(ErrorMessageConstants.PAN_NOT_UPDATED);
                    return Optional.of(errorMessage.toString());
                }
            }
            // check if aadhar front and back are there not rejected
            // check if pan doc is there and not in rejected
            // check if selfie doc is there and not rejected
            List<Document> documents = lead.getDocuments();
            if(documents.size() == 0){
                log.info("document sized 0 for lead {}",lead.getId());
                errorMessage.append(ErrorMessageConstants.EMPTY_DOCUMENTS);
                return Optional.of(errorMessage.toString());
            }
            Set<DocumentType> documentTypeSet = new HashSet<>();
            documentTypeSet.add(DocumentType.AADHAAR_FRONT);
            documentTypeSet.add(DocumentType.AADHAAR_BACK);
            documentTypeSet.add(DocumentType.USER_PHOTO);
            documentTypeSet.add(DocumentType.EDUCATION_CERTIFICATE);
            if (nocDetails!= null && nocDetails.equals("1")) {
                documentTypeSet.add(DocumentType.PAN_NOC);
            }
            // change is verified to not rejected
            documents.forEach(d -> {
                if(documentTypeSet.contains(d.getType()) && d.getStatus() != DocumentStatus.REJECTED) {
                    documentTypeSet.remove(d.getType());
                }
            });
            if(!documentTypeSet.isEmpty()){
                log.info("complete documents not uploaded for lead {}. Missing documents {}",lead.getId(), documentTypeSet);
                errorMessage.append(ErrorMessageConstants.INCOMPLETE_DOCUMENTS)
                        .append(" ")
                        .append(documentTypeSet);
                return Optional.of(errorMessage.toString());
            }

            // check if home address is available or not
            List<Address> addressList = lead.getAddress();
            boolean homeAddressFound = false;
            boolean workAddressFound = false;
            for(Address address: addressList){
                if(address.getType().equals(AddressTypes.HOME)){
                    homeAddressFound = true;
                }
                if(address.getType().equals(AddressTypes.WORK)){
                    workAddressFound = true;
                }
            }
            if(!homeAddressFound){
                log.info("home address empty for lead {}",lead.getId());
                errorMessage.append(ErrorMessageConstants.EMPTY_HOME_ADDRESS);
                return Optional.of(errorMessage.toString());
            }
            if(!workAddressFound) {
                log.info("work address empty for lead {}",lead.getId());
                errorMessage.append(ErrorMessageConstants.EMPTY_WORK_ADDRESS);
                return Optional.of(errorMessage.toString());
            }
            return Optional.empty();
        }catch (Exception e){
            log.info("error occurred isReadyToMoveToQC for lead {}. Error:  {}",lead.getId(), e.getMessage());
            e.printStackTrace();
            return Optional.of("Error while doing QC "+e.getMessage());
        }
    }

    @Override
    public Optional<String> validate(Lead lead) {
        log.info("lead state validation before converting lead");
        if(lead.getStatus().equals(LeadStatus.REGISTERED)){
            return Optional.of("Cannot convert lead. Lead is already registered");
        }
        if(!(lead.getStatus().equals(LeadStatus.VERIFIED) || lead.getStatus().equals(LeadStatus.REGISTRATION_REQUESTED))){
            return Optional.of("Cannot convert lead. Current leadStatus "+lead.getStatus());
        }
        return Optional.empty();
    }
}
