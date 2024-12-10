package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.PiTypeAndValue;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadBankDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.SyncLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.*;
import com.leadonboardingservice.leadonboardingservice.exceptions.ValidationException;
import com.leadonboardingservice.leadonboardingservice.externals.ChannelPartnerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.IAMServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.DocumentServiceResponseDto;
import com.leadonboardingservice.leadonboardingservice.helpers.EncryptionHelper;
import com.leadonboardingservice.leadonboardingservice.helpers.HashGenerator;
import com.leadonboardingservice.leadonboardingservice.helpers.TransactionManagerImpl;
import com.leadonboardingservice.leadonboardingservice.models.*;
import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLead;
import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLeadDoc;
import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLeadProfile;
import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLeadTraining;
import com.leadonboardingservice.leadonboardingservice.repositories.*;
import com.leadonboardingservice.leadonboardingservice.repositories.oldleadrepository.LeadDataRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.oldleadrepository.OldLeadDocumentRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.oldleadrepository.OldLeadProfileRepository;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadAdditionalDetailsService;
import com.leadonboardingservice.leadonboardingservice.services.LeadMigrationService;
import com.leadonboardingservice.leadonboardingservice.services.PosUserService;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.AwsS3ServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.validators.DuplicateBankValidator;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@AllArgsConstructor
public class LeadMigrationServiceImpl implements LeadMigrationService {
    private final LeadProfileRepository leadProfileRepository;
    private final LeadRepository leadRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ChannelPartnerServiceApiHelper channelPartnerServiceApiHelper;
    private final IAMServiceApiHelper iamServiceApiHelper;
    private final PosUserService posUserService;
    private final LeadAdditionalDetailsService leadAdditionalDetailsService;
    private final AgentLeadRegRepository agentLeadRegRepository;
    private final LeadDataRepository leadDataRepository;
    private final OldLeadDocumentRepository oldLeadDocumentRepository;
    private final OldLeadProfileRepository oldLeadProfileRepository;
    private final RemarksRepository remarksRepository;
    private final UserDocumentRepository userDocumentRepository;
    private final TransactionManagerImpl transactionManager;
    private final AsyncEsSyncService leadSyncService;
    private final HashGenerator hashGenerator;
    private final DuplicateBankValidator duplicateBankValidator;
    private final AwsS3ServiceApiHelper awsServiceHelper;
    private final EncryptionHelper encryptionHelper;

    public String leadStatusToEnum(Integer status){
        String leadState="";
        switch(status){
            case 1 :
            case 11:
                leadState = "CREATED";
                break;
            case 3 : leadState = "REGISTERED";
                break;
            case 7 : leadState = "REGISTRATION_REQUESTED";
                break;
            case 8 : leadState = "DOCUMENTS_REUPLOAD_REQUIRED";
                break;
            case 9 : leadState = "REJECTED";
                break;
            case 12: leadState = "CLOSED";
        }
        return leadState;
    }

    public String documentTypeToEnum(String docType){
        String result="";
        switch(docType){
            case "aadhar" : result = "AADHAAR";
                break;
            case "pan"    : result = "PAN";
                break;
            case "aadhar_front"    : result = "AADHAAR_FRONT";
                break;
            case "aadhar_back"    : result = "AADHAAR_BACK";
                break;
            case "photo"    : result = "USER_PHOTO";
                break;
            case "pan_noc" : result = "PAN_NOC";
                break;
            case "cancel_cheque":
            case "affidavit" :
                result = "CANCELLED_CHEQUE";
                break;
            case "x_certificate"    : result = "EDUCATION_CERTIFICATE";
                break;

        }
        return result;
    }

    public Lead convertOldLeadToLead(OldLead oldLead) throws Exception {
        Lead lead;
        Optional<Lead> optionalLead = leadRepository.findByOldLeadId(oldLead.getId());
        lead = optionalLead.orElseGet(Lead::new);
        lead.setOldLeadId(oldLead.getId());
        addIamUUID(oldLead,lead);
        addLead(oldLead, lead);
        addLeadOrigin(oldLead, lead);
        lead.addPiiFields();
        leadRepository.save(lead);
        addProfile(oldLead, lead);
        addAddress(oldLead, lead);
        addBankDetails(oldLead, lead);
        addFollowup(oldLead, lead);
        addDocuments(oldLead, lead);
        addTraining(oldLead, lead);
        log.info("old Lead to Lead migration {}", lead);
        return lead;
    }

    private void addLead(OldLead oldLead, Lead lead) throws ValidationException {
        if(StringUtils.isEmpty(oldLead.getMobile())){
            throw new ValidationException(" mobile is null for lead "+ oldLead.getId());
        }
        if(StringUtils.isEmpty(oldLead.getEmail())){
            throw new ValidationException(" email is null for lead "+ oldLead.getId());
        }
        if(oldLead.getCreatedAt() != null){
            lead.setCreatedAt(oldLead.getCreatedAt());
        } else {
            lead.setCreatedAt(LocalDateTime.now());
        }
        lead.setRejectionReason(oldLead.getRegRemarks());
        lead.setMobileDecrypted(oldLead.getMobile());
        lead.setEmailDecrypted(oldLead.getEmail());
        if(oldLead.getTenantId() != null && oldLead.getTenantId() != 0){
            lead.setTenantId(oldLead.getTenantId());
        } else {
            lead.setTenantId(1);
        }
        lead.setName(oldLead.getName());
        lead.setLeadOrigin(LeadOriginChannels.POS);
        if(oldLead.getAssignedSalesUserId() != null) {
            Optional<User> leadAssignedUser = posUserService.getUser(Long.valueOf(oldLead.getAssignedSalesUserId()));
            if (leadAssignedUser.isPresent()) {
                lead.setAssignedSalesIamUuid(leadAssignedUser.get().getUuid());
            }
        }
    }

    private void addIamUUID(OldLead oldLead, Lead lead) throws ValidationException {
        String uuid = "";
        if(oldLead.getTenantId() == null || oldLead.getTenantId() == 1) {
            uuid = iamServiceApiHelper.fetchIAMId(null, null, oldLead.getMobile(), 1L, "");
            if (StringUtils.isEmpty(uuid)) {
                if (!StringUtils.isEmpty(oldLead.getUuid())) {
                    uuid = oldLead.getUuid();
                }
            }
            //String uuid = UUID.randomUUID().toString();
            if (StringUtils.isEmpty(uuid)) {
                throw new ValidationException(" Unable to generate uuid " + oldLead.getId());
            }
        } else {
            uuid = oldLead.getUuid();
        }
        lead.setUuid(uuid);
    }

    private void addTraining(OldLead oldLead, Lead lead) {
        List<OldLeadTraining> oldLeadTrainingList = agentLeadRegRepository.findByLeadToken(oldLead.getLeadToken());
        if(oldLeadTrainingList != null && !oldLeadTrainingList.isEmpty()) {
            oldLead.setOldLeadTraining(oldLeadTrainingList);
            if (oldLead.getOldLeadTraining() != null && !oldLead.getOldLeadTraining().isEmpty()) {
                List<LeadTraining> leadTrainings;
                if (lead.getLeadTrainings() != null && !lead.getLeadTrainings().isEmpty()) {
                    leadTrainings = lead.getLeadTrainings();
                } else {
                    leadTrainings = new ArrayList<>();
                }
                oldLead.getOldLeadTraining().forEach(i -> {
                    LeadTraining leadTraining;
                    Optional<LeadTraining> optionalLeadTraining = leadTrainings.stream().filter(x -> x.getProduct().equals(mapTrainingProduct(i))).findFirst();
                    if (optionalLeadTraining.isPresent()) {
                        leadTraining = optionalLeadTraining.get();
                    } else {
                        leadTraining = new LeadTraining();
                        leadTrainings.add(leadTraining);
                    }
                    leadTraining.setLeadId(oldLead.getId());
                    if (i.getExamStatus() == 1) {
                        leadTraining.setStatus(TrainingStatuses.TRAINING_MATERIAL_SHARED);
                    } else if (i.getExamStatus() == 2) {
                        leadTraining.setStatus(TrainingStatuses.TEST_LINK_SHARED);
                    } else if (i.getExamStatus() == 3) {
                        leadTraining.setStatus(TrainingStatuses.TEST_FAILED);
                    } else if (i.getExamStatus() == 4) {
                        leadTraining.setStatus(TrainingStatuses.COMPLETED);
                    } else if (i.getExamStatus() == 5) {
                        leadTraining.setStatus(TrainingStatuses.TRAINING_MATERIAL_DOWNLOADED);
                    }
                    //   leadTraining.setStatus(TrainingStatuses.STARTED);
                    if (i.getInsuranceType() == 1)
                        leadTraining.setProduct(InsuranceProduct.GENERAL);
                    else if (i.getInsuranceType() == 2)
                        leadTraining.setProduct(InsuranceProduct.LIFE);
                    //   leadTraining.setAgreementAt(i.g);
                    leadTraining.setLead(lead);
                });
                lead.setLeadTrainings(leadTrainings);
                log.info("Old Lead trainings to Lead migration {}", lead.getLeadTrainings());
            }
        }
    }

    private void addDocuments(OldLead oldLead, Lead lead) {
        List<OldLeadDoc> oldLeadDocs = oldLeadDocumentRepository.findByLeadId(oldLead.getId());
        oldLead.setLeadDoc(oldLeadDocs);
        if(oldLead.getLeadDoc() != null) {
            List<Document> documents;
            if(lead.getDocuments() != null && !lead.getDocuments().isEmpty()){
                documents = lead.getDocuments();
            } else {
                documents = new ArrayList<>();
            }
            oldLead.getLeadDoc().forEach(i -> {
                if(i.getDocumentStatus() != 0) {
                    Optional<Document> existingDocument = documents.stream().filter(x -> x.getType().equals(DocumentType.valueOf(documentTypeToEnum(i.getDocumentType())))).findFirst();
                    Document document;
                    if (existingDocument.isPresent()) {
                        document = existingDocument.get();
                    } else {
                        document = new Document();
                        documents.add(document);
                    }
                    if (documentTypeToEnum(i.getDocumentType()) != "")
                        document.setType(DocumentType.valueOf(documentTypeToEnum(i.getDocumentType())));
                    // document.setDocumentId();
                    document.setUrl(i.getFilePath());
                    if (i.getDocumentStatus() == 1) {
                        document.setIsReUploaded(false);
                    } else {
                        document.setIsReUploaded(true);
                    }
                    if(i.getDocumentStatus() != null && i.getDocumentStatus() == 2){
                        document.setStatus(DocumentStatus.REJECTED);
                    } else{
                        document.setStatus(DocumentStatus.UPLOADED);
                    }
                    if (!StringUtils.isEmpty(i.getSource()) && i.getSource().equalsIgnoreCase("ckyc")) {
                        document.setSource(DocumentSources.AUTOMATED);
                    } else {
                        document.setSource(DocumentSources.MANUAL);
                    }
                    if(!StringUtils.isEmpty(i.getReasonId())){
                        document.setRejectStatusRemarkId(getRemarkId(i.getReasonId()));
                    }
                    document.setLead(lead);
                }
            });
            lead.setDocuments(documents);
            log.info("Old Lead documents to Lead migration {}", lead.getDocuments());
        }
    }

    private void addFollowup(OldLead oldLead, Lead lead) {
        List<LeadFollowup> leadFollowupList;
        if(lead.getLeadFollowups() != null && !lead.getLeadFollowups().isEmpty()){
            leadFollowupList = lead.getLeadFollowups();
        } else {
            leadFollowupList = new ArrayList<>();
        }
        if(!StringUtils.isEmpty(oldLead.getFollowUpText())) {
            LeadFollowup leadFollowup;
            Optional<LeadFollowup> leadFollowupOptional = leadFollowupList.stream().filter(LeadFollowup::getIsActive).findFirst();
            if (leadFollowupOptional.isPresent()) {
                leadFollowup = leadFollowupOptional.get();
            } else {
                leadFollowup = new LeadFollowup();
                leadFollowupList.add(leadFollowup);
            }
            leadFollowup.setRemarks(oldLead.getFollowUpText());
            leadFollowup.setStatus(LeadFollowupStatuses.CREATED);
            if (StringUtils.isEmpty(oldLead.getFollowUpTime())) {
                leadFollowup.setFollowupAt(leadFollowup.getFollowupAt());
            }
            leadFollowup.setIsActive(true);
            leadFollowup.setIsDeleted(false);
            leadFollowup.setLead(lead);
            lead.setLeadFollowups(leadFollowupList);
            log.info("Old Lead followup to Lead migration {}", lead.getLeadFollowups());
        }
    }

    private void addBankDetails(OldLead oldLead, Lead lead) throws Exception {
        List<BankDetail> bankDetailList;
        if(lead.getBankDetails() != null && !lead.getBankDetails().isEmpty()){
            bankDetailList = lead.getBankDetails();
        } else {
            bankDetailList = new ArrayList<>();
        }
        Optional<BankDetail> optionalBankDetail = bankDetailList.stream().findFirst();
        BankDetail bankDetail;
        bankDetail = optionalBankDetail.orElseGet(BankDetail::new);
        bankDetail.setBankName(oldLead.getBankName());
        bankDetail.setBankBranchName(oldLead.getBankBranchName());
        bankDetail.setAccountNumberDecrypted(oldLead.getAccountNumber());
        bankDetail.setIfsc(oldLead.getIfscCode());
        bankDetail.setBeneficiaryName(oldLead.getBeneficiaryName());
        bankDetail.setBeneficiaryId(oldLead.getBeneficiaryId());
        bankDetail.setIsDeleted(false);
        bankDetail.setIsActive(true);
        if(oldLead.getPennyDropFlag() != null &&
                oldLead.getPennyDropFlag().equals(1) &&
                oldLead.getAccountNumber().equals(oldLead.getVerifiedAccountNumber()) &&
                !StringUtils.isEmpty(oldLead.getBeneficiaryName())){
            log.info("setting verified account for lead {} during migration ", lead.getUuid());
            bankDetail.setIsBankVerified(true);
        } else {
            bankDetail.setIsBankVerified(false);
        }
        bankDetail.setLead(lead);
        //bankDetail.setIsActive();
        //bankDetail.setIsBankVerified();
        bankDetail.addPiiFields();
        bankDetailList.add(bankDetail);
        lead.setBankDetails(bankDetailList);
        log.info("Old Lead bank to Lead migration {}", lead.getBankDetails());
    }

    private void addAddress(OldLead oldLead, Lead lead) {
        List<Address> addressList;
        if(lead.getAddress() != null && !lead.getAddress().isEmpty()){
            addressList = lead.getAddress();
        } else {
            addressList = new ArrayList<>();
        }
        if(oldLead.getAddress()!=null || oldLead.getLocality()!=null || oldLead.getPincode()!=null || oldLead.getCityId()!=null || oldLead.getStateId()!=null){
            Optional<Address> optionalHomeAddress = addressList.stream().filter(x -> x.getType().equals(AddressTypes.HOME)).findFirst();
            Address homeAddress;
            if(optionalHomeAddress.isPresent()){
                homeAddress = optionalHomeAddress.get();
            } else {
                homeAddress = new Address();
                addressList.add(homeAddress);
            }
            homeAddress.setLead(lead);
            homeAddress.setType(AddressTypes.HOME);
            homeAddress.setAddress(oldLead.getAddress());
            homeAddress.setLocality(oldLead.getLocality());
            homeAddress.setPincode(oldLead.getPincode());
            homeAddress.setCityId(oldLead.getCityId());
            homeAddress.setStateId(oldLead.getStateId());
        }


        if(oldLead.getSameWorkAddress()!=null && oldLead.getSameWorkAddress().equalsIgnoreCase("1")){
            Optional<Address> optionalWorkAddress = addressList.stream().filter(x -> x.getType().equals(AddressTypes.WORK)).findFirst();
            Address workAddress;
            if(optionalWorkAddress.isPresent()){
                workAddress = optionalWorkAddress.get();
            } else {
                workAddress = new Address();
                addressList.add(workAddress);
            }
            workAddress.setLead(lead);
            workAddress.setType(AddressTypes.WORK);
            workAddress.setAddress(oldLead.getAddress());
            workAddress.setLocality(oldLead.getLocality());
            workAddress.setPincode(oldLead.getPincode());
            workAddress.setCityId(oldLead.getCityId());
            workAddress.setStateId(oldLead.getStateId());
        }
        else if(oldLead.getWorkAddress() !=null || oldLead.getWorkCityId()!=null || oldLead.getWorkLocality()!=null || oldLead.getWorkStateId()!=null || oldLead.getWorkPincode()!=null){
            Optional<Address> optionalWorkAddress = addressList.stream().filter(x -> x.getType().equals(AddressTypes.WORK)).findFirst();
            Address workAddress;
            if(optionalWorkAddress.isPresent()){
                workAddress = optionalWorkAddress.get();
            } else {
                workAddress = new Address();
                addressList.add(workAddress);
            }
            workAddress.setLead(lead);
            workAddress.setType(AddressTypes.WORK);
            workAddress.setAddress(oldLead.getWorkAddress());
            workAddress.setLocality(oldLead.getWorkLocality());
            workAddress.setPincode(oldLead.getWorkPincode());
            workAddress.setCityId(oldLead.getWorkCityId());
            workAddress.setStateId(oldLead.getWorkStateId());
        }

        if(oldLead.getSameShopAddress()!=null && oldLead.getSameShopAddress().equalsIgnoreCase("1")){
            Optional<Address> optionalShopAddress = addressList.stream().filter(x -> x.getType().equals(AddressTypes.SHOP)).findFirst();
            Address shopAddress;
            if(optionalShopAddress.isPresent()){
                shopAddress = optionalShopAddress.get();
            } else {
                shopAddress = new Address();
                addressList.add(shopAddress);
            }
            shopAddress.setLead(lead);
            shopAddress.setType(AddressTypes.WORK);
            shopAddress.setAddress(oldLead.getAddress());
            shopAddress.setLocality(oldLead.getLocality());
            shopAddress.setPincode(oldLead.getPincode());
            shopAddress.setCityId(oldLead.getCityId());
            shopAddress.setStateId(oldLead.getStateId());
        }
        else if(oldLead.getShopAddress()!=null || oldLead.getShopLocality()!=null || oldLead.getShopPincode()!=null || oldLead.getShopCityId()!=null || oldLead.getShopStateId()!=null){
            Optional<Address> optionalShopAddress = addressList.stream().filter(x -> x.getType().equals(AddressTypes.SHOP)).findFirst();
            Address shopAddress;
            if(optionalShopAddress.isPresent()){
                shopAddress = optionalShopAddress.get();
            } else {
                shopAddress = new Address();
                addressList.add(shopAddress);
            }
            shopAddress.setType(AddressTypes.SHOP);
            if(oldLead.getShopAddress()!=null)
                shopAddress.setAddress(oldLead.getShopAddress());
            if(oldLead.getShopLocality()!=null)
                shopAddress.setLocality(oldLead.getShopLocality());
            if(oldLead.getShopPincode()!=null)
                shopAddress.setPincode(oldLead.getShopPincode());
            if(oldLead.getShopCityId()!=null)
                shopAddress.setCityId(oldLead.getShopCityId());
            if(oldLead.getShopStateId()!=null)
                shopAddress.setStateId(oldLead.getShopStateId());
            shopAddress.setLead(lead);
        }
        log.info("Old Lead address to Lead migration {}", lead.getAddress());
        lead.setAddress(addressList);
    }

    private void addProfile(OldLead oldLead, Lead lead) throws Exception {
        if(!StringUtils.isEmpty(oldLead.getPan())) {
            Optional<OldLeadProfile> optionalOldLeadProfile = oldLeadProfileRepository.findByLeadToken(oldLead.getLeadToken());
            LeadProfile leadProfile;
            if (lead.getLeadProfile() != null) {
                leadProfile = lead.getLeadProfile();
            } else {
                leadProfile = new LeadProfile();
            }
            leadProfile.setPanDecrypted(oldLead.getPan());
            leadProfile.addPiiFields();
            leadProfile.setIsPanVerified(false);
            leadProfile.setLead(lead);
            if (oldLead.getDateOfBirth() != null) {
                leadProfile.setDateOfBirth(oldLead.getDateOfBirth());
            }
            if (optionalOldLeadProfile.isPresent()) {
                OldLeadProfile oldLeadProfile = optionalOldLeadProfile.get();
                if (oldLeadProfile.getEducationCertificate() != null) {
                    leadProfile.setEducationDetails(String.valueOf(oldLeadProfile.getEducationCertificate()));
                }
            }
            leadProfileRepository.save(leadProfile);
            lead.setLeadProfile(leadProfile);
            log.info("Old Lead profile to Lead migration {}", lead.getLeadProfile());
        }
    }

    private void addLeadOrigin(OldLead oldLead, Lead lead) throws ValidationException {
        if(!StringUtils.isEmpty(oldLead.getReferrerUserId())) {
            try {
                ChannelPartnerDto channelPartnerDto = channelPartnerServiceApiHelper.getByDealerId(oldLead.getReferrerUserId());
                lead.setReferrerIamUuid(channelPartnerDto.getIamUUID());
                lead.setLeadOriginatedBy(LeadOriginMethods.DEALER);
            }catch (Exception e){
                log.error("unable to retrieve dealer details for lead {}", oldLead.getReferrerUserId());
                throw new ValidationException("unable to retrieve dealer details for rap lead {}"+ oldLead.getId());
            }
        } else {
            if(lead.getLeadOrigin() == null) {
                lead.setLeadOriginatedBy(LeadOriginMethods.SALES);
            }else if(oldLead.getLeadOrigin().equalsIgnoreCase("self")) {
                lead.setLeadOriginatedBy(LeadOriginMethods.SELF);
            } else if(oldLead.getLeadOrigin().equalsIgnoreCase("rm_flow")){
                lead.setLeadOriginatedBy(LeadOriginMethods.SALES);
            } else {
                lead.setLeadOriginatedBy(LeadOriginMethods.ADMIN);
            }
        }
        try {
            LeadStatus leadStatus = LeadStatus.valueOf(leadStatusToEnum(oldLead.getStatus()));
            lead.setStatus(leadStatus);
        } catch (Exception e){
            log.error("unable to map lead status for old lead {} ", oldLead.getId());
            throw new ValidationException(" unable to map lead status for old lead {} "+ oldLead.getId());
        }
    }

    private Integer getRemarkId(String reasonId) {
        if(reasonId.equalsIgnoreCase("1")){
            return 15;
        }
        if(reasonId.equalsIgnoreCase("2")){
            return 16;
        }
        if(reasonId.equalsIgnoreCase("3")){
            return 17;
        }
        if(reasonId.equalsIgnoreCase("4")){
            return 18;
        }
        if(reasonId.equalsIgnoreCase("5")){
            return 19;
        }
        if(reasonId.equalsIgnoreCase("6")){
            return 20;
        }
        if(reasonId.equalsIgnoreCase("7")){
            return 21;
        }
        if(reasonId.equalsIgnoreCase("8")){
            return 22;
        }
        return null;
    }

    private InsuranceProduct mapTrainingProduct(OldLeadTraining oldLeadTraining) {
        if(oldLeadTraining.getInsuranceType() == 2){
            return InsuranceProduct.LIFE;
        } else {
            return InsuranceProduct.GENERAL;
        }
    }

    @Override
    public void migrateLeads(OldLead lead) throws Exception {
        log.info("migrating old lead with id {}", lead.getId());
        if(leadRepository.findByOldLeadId(lead.getId()).isPresent()){
            return;
        }
        List<LeadAdditionalDetails> leadAdditionalDetailsList = new ArrayList<>();
        Lead toLead = convertOldLeadToLead(lead);
        leadRepository.save(toLead);
        if(!StringUtils.isEmpty(lead.getUtmSource())){
            log.info("adding utm source for lead {}",toLead.getId());
            LeadAdditionalDetails utmSourceDetail = LeadAdditionalDetails.builder()
                    .propertyName(LeadConstants.UTM_SOURCE)
                    .propertyValue(lead.getUtmSource()).build();
            leadAdditionalDetailsList.add(utmSourceDetail);
            leadAdditionalDetailsService.addDetails(toLead.getUuid(),leadAdditionalDetailsList);
        }
        log.info("mapped old lead {} to new lead {} ",lead.getId(),toLead.getId());
    }

    @Override
    public void syncLeads(Long leadId, SyncLeadRequestDto syncLeadDto) throws Exception {
        Lead lead = leadRepository.findById(leadId).get();
        if(lead.getOldLeadId() != null){
            log.info("syncing lead {}", lead.getUuid());
            OldLead oldLead = leadDataRepository.findById(lead.getOldLeadId()).orElseThrow(() -> new RuntimeException("old lead not found"));
            if(syncLeadDto.isSyncRejectionRemark()){
                lead.setRejectionReason(oldLead.getRegRemarks());
            }
            if(syncLeadDto.isSyncIamUUID()) {
                addIamUUID(oldLead, lead);
            }
            if(syncLeadDto.isSyncLeadData()) {
                addLead(oldLead, lead);
            }
            if(syncLeadDto.isSyncLeadOrigin()) {
                addLeadOrigin(oldLead, lead);
            }
            if(syncLeadDto.isSyncLeadPiiFields()) {
                lead.addPiiFields();
            }
            leadRepository.save(lead);
            if(syncLeadDto.isSyncLeadProfileData()) {
                addProfile(oldLead, lead);
            }
            if(syncLeadDto.isSyncLeadAddressData()) {
                addAddress(oldLead, lead);
            }
            if(syncLeadDto.isSyncLeadBankData()) {
                addBankDetails(oldLead, lead);
            }
            if(syncLeadDto.isSyncLeadFollowUpData()) {
                addFollowup(oldLead, lead);
            }
            if(syncLeadDto.isSyncLeadDocumentsData()) {
                addDocuments(oldLead, lead);
            }
            if(syncLeadDto.isSyncLeadTrainingData()) {
                addTraining(oldLead, lead);
            }
        }
    }

    private void validatePan(String leadUuid, String userPan) {
        log.info("checking for duplicate pan in lead table for lead {} pan {}",leadUuid, userPan);
        String panHashed = hashGenerator.generate(userPan);
        List<LeadProfile> leadProfileList = leadProfileRepository.findByPanHashed(panHashed);

        if(!leadProfileList.isEmpty()) {
            Lead lead = leadProfileList.get(0).getLead();
            if(!lead.getUuid().equalsIgnoreCase(leadUuid)) {
                Long displayLeadId = lead.getId();
                throw new RuntimeException("lead already exists with same pan: "+ userPan +". LeadId: "+displayLeadId);
            }
        }
    }

    private void addLeadProfileFromUser(User posUser, Lead newLead, ChannelPartnerDto channelPartnerDto) throws Exception {
        //creating lead profile
        log.info("adding lead profile from user for id {}" , newLead.getUuid());
        LeadProfile leadProfile;
        if (newLead.getLeadProfile() != null) {
            leadProfile = newLead.getLeadProfile();
        } else {
            leadProfile = new LeadProfile();
        }
        leadProfile.setLead(newLead);
        leadProfile.setPanEncrypted(channelPartnerDto.getPanCardEncrypted());
        leadProfile.decryptAllPiiFields();
        leadProfile.addPiiFields();
        leadProfile.setIsPanVerified(false);
        leadProfile.setDateOfBirth( posUser.getDateOfBirth() );
        validatePan(newLead.getUuid(), leadProfile.getPanDecrypted());
        leadProfileRepository.save(leadProfile);
        newLead.setLeadProfile(leadProfile);
    }
    private void addLeadBankFromUser(User posUser, Lead newLead, ChannelPartnerDto channelPartnerDto) throws Exception {
        log.info("adding lead bank details from user for id {}" , newLead.getUuid());
        //adding lead bank details
        List<PiTypeAndValue> piData = new ArrayList<>();
        if (channelPartnerDto.getAccountNumber() != null
                && !channelPartnerDto.getAccountNumber().toString().isEmpty()) {
            piData.add(new PiTypeAndValue("accountNumber", channelPartnerDto.getAccountNumber()));
        }
        if (channelPartnerDto.getIfsc() != null
                && !channelPartnerDto.getIfsc().toString().isEmpty()) {
            piData.add(new PiTypeAndValue("ifsc", channelPartnerDto.getIfsc()));  
        }

        Map<String, String> decryptedBankData = encryptionHelper.decrypt(piData);
        LeadBankDto leadBankDto = LeadBankDto.builder().accountNumber(decryptedBankData.get("accountNumber")).build();
        Optional<String> error = duplicateBankValidator.validate(newLead.getUuid(),leadBankDto);
        if(error.isPresent()){
            throw new RuntimeException(error.get());
        }
        List<BankDetail> bankDetailList;
        if(newLead.getBankDetails() != null && !newLead.getBankDetails().isEmpty()){
            bankDetailList = newLead.getBankDetails();
        } else {
            bankDetailList = new ArrayList<>();
        }
        Optional<BankDetail> optionalBankDetail = bankDetailList.stream().findFirst();

        BankDetail bankDetail;
        bankDetail = optionalBankDetail.orElseGet(BankDetail::new);

        bankDetail.setIsJointAccount(channelPartnerDto.getIsJointBankAccount());
        bankDetail.setBeneficiaryName(channelPartnerDto.getBeneficiaryName());
        bankDetail.setAccountNumberDecrypted(decryptedBankData.get("accountNumber"));
        bankDetail.setIfsc(decryptedBankData.get("ifsc"));
        bankDetail.setIsDeleted(false);
        bankDetail.setIsActive(true);
        bankDetail.setIsBankVerified(true);
        bankDetail.setLead(newLead);
        bankDetail.addPiiFields();

        bankDetailList.add(bankDetail);
        newLead.setBankDetails(bankDetailList);
    }
    private void addLeadAddressFromUser(User posUser, Lead newLead) throws Exception {
        log.info("adding lead address from user for id {}" , newLead.getUuid());
        //adding lead address
        List<Address> addressList;
        if(newLead.getAddress() != null && !newLead.getAddress().isEmpty()){
            addressList = newLead.getAddress();
        } else {
            addressList = new ArrayList<>();
        }

        if(posUser.getAddress()!=null || posUser.getLocality()!=null || posUser.getPincode()!=null || posUser.getCityId()!=null || posUser.getStateId()!=null){
            Optional<Address> optionalHomeAddress = addressList.stream().filter(x -> x.getType().equals(AddressTypes.HOME)).findFirst();
            Address homeAddress;
            if(optionalHomeAddress.isPresent()){
                homeAddress = optionalHomeAddress.get();
            } else {
                homeAddress = new Address();
                addressList.add(homeAddress);
            }
            homeAddress.setLead(newLead);
            homeAddress.setType(AddressTypes.HOME);
            homeAddress.setAddress(posUser.getAddress());
            homeAddress.setLocality(posUser.getLocality());
            homeAddress.setPincode(String.valueOf(posUser.getPincode()));
            homeAddress.setCityId(posUser.getCityId());
            homeAddress.setStateId(posUser.getStateId());

            Optional<Address> optionalWorkAddress = addressList.stream().filter(x -> x.getType().equals(AddressTypes.WORK)).findFirst();
            Address workAddress;
            if(optionalWorkAddress.isPresent()){
                workAddress = optionalWorkAddress.get();
            } else {
                workAddress = new Address();
                addressList.add(workAddress);
            }
            workAddress.setLead(newLead);
            workAddress.setType(AddressTypes.WORK);
            workAddress.setAddress(posUser.getAddress());
            workAddress.setLocality(posUser.getLocality());
            workAddress.setPincode(String.valueOf(posUser.getPincode()));
            workAddress.setCityId(posUser.getCityId());
            workAddress.setStateId(posUser.getStateId());
        }
        newLead.setAddress(addressList);
    }
    private void addLeadDocumentsFromUser(User posUser, Lead newLead) throws Exception {
        //creating lead profile
        log.info("adding lead documents from user for id {}" , newLead.getUuid());
        List<UserDocument> userDocumentsList = userDocumentRepository.findByUserIdAndStatusNot(posUser.getId(), 0);
        if(userDocumentsList != null && !userDocumentsList.isEmpty()) {

            List<Document> leadDocumentsList;
            if(newLead.getDocuments() != null && !newLead.getDocuments().isEmpty()) {
                leadDocumentsList = newLead.getDocuments();
            } else {
                leadDocumentsList = new ArrayList<>();
            }

            userDocumentsList.forEach(doc -> {
                if(doc.getStatus() !=0) {
                    Optional<Document> existingDocument = leadDocumentsList.stream()
                            .filter(x -> x.getType().equals(DocumentType.valueOf(documentTypeToEnum(doc.getDocumentType())))).findFirst();
                    Document leadDocument;
                    if (existingDocument.isPresent()) {
                        leadDocument = existingDocument.get();
                    } else {
                        leadDocument = new Document();
                        leadDocumentsList.add(leadDocument);
                    }

                    if (documentTypeToEnum(doc.getDocumentType()) != "" )
                        leadDocument.setType(DocumentType.valueOf(documentTypeToEnum(doc.getDocumentType())));

                    if(StringUtils.isEmpty(doc.getDocId())) {
                        DocumentServiceResponseDto documentServiceResponseDto = awsServiceHelper.uploadToDocService(doc.getFilePath());
                        if(documentServiceResponseDto != null && documentServiceResponseDto.getData() != null && !StringUtils.isEmpty(documentServiceResponseDto.getData().getDocId())) {
                            leadDocument.setDocumentId(documentServiceResponseDto.getData().getDocId());
                        }else{
                            leadDocument.setUrl(doc.getFilePath());
                        }
                    }else {
                        leadDocument.setDocumentId(doc.getDocId());
                    }

                    leadDocument.setSource(DocumentSources.MANUAL);
                    leadDocument.setIsReUploaded(false);
                    leadDocument.setStatus(DocumentStatus.UPLOADED);
                    leadDocument.setLead(newLead);
                }
            });

            newLead.setDocuments(leadDocumentsList);

            log.info("Documents updated for lead {}", newLead.getUuid());
        }
    }

    private Lead addLeadBasicDetails(User posUser, ChannelPartnerDto channelPartnerDto) throws Exception {
        Lead newLead;
        Optional<Lead> optionalLead = leadRepository.findByUuid(posUser.getUuid());
        newLead = optionalLead.orElseGet(Lead::new);

        log.info("Adding lead basic details from user for id {}", posUser.getUuid());
        newLead.setUuid(posUser.getUuid());
        newLead.setMobileEncrypted(channelPartnerDto.getMobile());
        newLead.setEmailEncrypted(channelPartnerDto.getEmail());
        newLead.setStatus(LeadStatus.REGISTERED);
        newLead.setName(posUser.getFirstName());
        newLead.setCityId(posUser.getCityId());
        newLead.setLeadOrigin(LeadOriginChannels.POS);
        newLead.setIrdaId(channelPartnerDto.getIrdaId());
        newLead.setIrdaReportingDate(posUser.getIrdaReportingDate());
        newLead.setChannelPartnerId(posUser.getChannel_partner_id());
        newLead.setCreatedAt(posUser.getAdded());

        if(posUser.getTenantId() != null && posUser.getTenantId() != 0){
            newLead.setTenantId(posUser.getTenantId());
        } else {
            newLead.setTenantId(1);
        }

        if(!StringUtils.isEmpty(posUser.getReferDealerId())) {
            newLead.setReferrerIamUuid(posUser.getReferDealerId());
            newLead.setLeadOriginatedBy(LeadOriginMethods.DEALER);
        }else {
            newLead.setLeadOriginatedBy(LeadOriginMethods.ADMIN);
        }
        newLead.decryptAllPiiFields();
        newLead.addPiiFields();
        leadRepository.save(newLead);
        return newLead;
    }

    private void addLeadAdditionalDetails(Lead newLead) {
        List<LeadAdditionalDetails> leadAdditionalDetailsList = new ArrayList<>();
        log.info("adding lead utm source details {}" , newLead.getUuid());
        LeadAdditionalDetails utmSourceDetail = LeadAdditionalDetails.builder()
                .propertyName(LeadConstants.UTM_SOURCE)
                .propertyValue("migrated").build();
        leadAdditionalDetailsList.add(utmSourceDetail);
        leadAdditionalDetailsService.addDetails(newLead.getUuid(),leadAdditionalDetailsList);
    }

    @Override
    public Lead createLeadFromUser(String uuid) throws Exception {
        log.info("creating new lead from user with id {}", uuid);
        User posUser = posUserService.getUserByUUID(uuid)
                .orElseThrow(() -> new RuntimeException("lead/user not found with id " + uuid));
        Optional<Lead> optionalLead = leadRepository.findByUuid(posUser.getUuid());
        Lead lead;
        ChannelPartnerDto channelPartner = channelPartnerServiceApiHelper.getByChannelPartnerIamId(uuid);
        if(optionalLead.isPresent()){
           lead = optionalLead.get();
        }else {
            lead = addNewLead(posUser, channelPartner);
            leadRepository.save(lead);
            syncLead(lead.getId());
        }
        posUser.setLeadId(lead.getId());
        posUser.setSyncDate(LocalDateTime.now());
        posUserService.save(posUser);
        return lead;
    }

    private Lead addNewLead(User posUser, ChannelPartnerDto channelPartnerDto) throws Exception{
        Lead newLead = addLeadBasicDetails(posUser, channelPartnerDto);
        addLeadProfileFromUser(posUser, newLead, channelPartnerDto);
        addLeadDocumentsFromUser(posUser, newLead);
        addLeadBankFromUser(posUser, newLead, channelPartnerDto);
        addLeadAddressFromUser(posUser, newLead);
        addLeadAdditionalDetails(newLead);
        return newLead;
    }

    private void syncLead(Long leadId) {
        transactionManager.executeAfterTransactionCommits(()->leadSyncService.upsertLeadAsync(leadId));
    }

}
