package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.constants.IAMConstants;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.AddressDto;
import com.leadonboardingservice.leadonboardingservice.dtos.LeadAdditionalDetailsDto;
import com.leadonboardingservice.leadonboardingservice.dtos.LeadSource;
import com.leadonboardingservice.leadonboardingservice.dtos.request.*;
import com.leadonboardingservice.leadonboardingservice.dtos.response.*;
import com.leadonboardingservice.leadonboardingservice.enums.*;
import com.leadonboardingservice.leadonboardingservice.exceptions.*;
import com.leadonboardingservice.leadonboardingservice.externals.IAMServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.IAMResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.IAMUpdateRequestDto;
import com.leadonboardingservice.leadonboardingservice.helpers.NullAwareBeanUtilsBean;
import com.leadonboardingservice.leadonboardingservice.helpers.TransactionManagerImpl;
import com.leadonboardingservice.leadonboardingservice.mappers.*;
import com.leadonboardingservice.leadonboardingservice.models.*;
import com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers.RequestForRegistrationEventHandler;
import com.leadonboardingservice.leadonboardingservice.services.*;
import com.leadonboardingservice.leadonboardingservice.validators.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.constraints.NotNull;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeadManagerImpl implements LeadManager {

    private final LeadAddressService leadAddressService;
    private final LeadProfileService leadProfileService;
    private final LeadDocumentsService leadDocumentsService;
    private final LeadTrainingService leadTrainingService;
    private final LeadBasicDetailsService leadBasicDetailsService;
    private final LeadBankService leadBankService;
    private final LeadFollowUpService leadFollowUpService;
    private final BankVerificationService bankVerificationService;
    private final LeadAdditionalDetailsService leadAdditionalDetailsService;
    private final LeadService leadService;

    private final LeadProfileMapper leadProfileMapper;
    private final LeadBasicDetailsMapper leadBasicDetailsMapper;
    private final LeadTrainingDetailsMapper leadTrainingDetailsMapper;
    private final LeadFollowUpMapper leadFollowUpMapper;
    private final LeadBankMapper leadBankMapper;
    private final LeadAddressMapper leadAddressMapper;
    private final LeadDocumentMapper leadDocumentMapper;
    private final LeadAdditionalDetailsMapper leadAdditionalDetailsMapper;

    private final List<CreateLeadValidator> leadValidators;
    private final DuplicatePanValidator duplicatePanValidator;
    private final DuplicateBankValidator duplicateBankValidator;
    private final IAMServiceApiHelper iamServiceApiHelper;
    private final LeadRegisterDocumentServiceImpl leadRegisterDocumentService;
    private final AsyncEsSyncService leadSyncService;
    private final CKYCService ckycService;

    private final TransactionManagerImpl transactionManager;
    private final RequestForRegistrationEventHandler registrationEventHandler;
    private final PanVerificationService panVerificationService;
    private final AadhaarService aadhaarService;

    private final DuplicateIrdaValidator duplicateIrdaValidator;
    private final DuplicateEmailValidator duplicateEmailValidator;

    @Override
    public CreateLeadResponseDto createLead(CreateLeadRequestDto createLeadDto) throws Exception {
        log.info("creating lead [createLeadDto] {}", createLeadDto);
        String iamUUID = createLeadDto.getUuid();
        if (StringUtils.isEmpty(iamUUID)) {
            iamUUID = iamServiceApiHelper.fetchIAMId(
                    createLeadDto.getName(),
                    createLeadDto.getEmail(),
                    createLeadDto.getMobile(),
                    createLeadDto.getTenantId(),
                    createLeadDto.getReferAuthId());
        }
        IAMResponseDto.IAMResponse iamResponse = iamServiceApiHelper.validateIamId(
                iamUUID,
                createLeadDto.getTenantId());
        // Considering creating mobile and email fetched from Iam , rather than passed
        // from req body
        // email can be updated separately with the PUT req
        createLeadDto.setUuid(iamResponse.getUuid());
        createLeadDto.setMobile(iamResponse.getMobile());
        createLeadDto.setEmail(iamResponse.getEmail());
        createLeadDto.setTenantId(iamResponse.getTenantId());
        List<String> errors = validateLead(createLeadDto);
        if (!errors.isEmpty()) {
            throw new InvalidRequestException(String.valueOf(errors));
        }
        Lead createLead = leadBasicDetailsMapper.toEntity(createLeadDto);
        createLead.addPiiFields();
        Lead lead = leadBasicDetailsService.addLeadBasicDetails(createLead);
        addAdditionalDetails(lead.getUuid(), createLeadDto);
        syncLead(lead.getId());
        return CreateLeadResponseDto.builder().uuid(lead.getUuid()).build();
    }

    private void syncLead(Long leadId) {
        transactionManager.executeAfterTransactionCommits(() -> leadSyncService.upsertLeadAsync(leadId));
    }

    private void addAdditionalDetails(String id, CreateLeadRequestDto createLeadDto) {
        log.info("creating lead additional details {} for lead {} ", createLeadDto, id);
        List<LeadAdditionalDetails> leadAdditionalDetailsList = new ArrayList<>();
        LeadSource leadSource = createLeadDto.getLeadSource();
        if (leadSource != null) {
            if (leadSource.getUtmSource() != null) {
                LeadAdditionalDetails utmSourceDetail = LeadAdditionalDetails.builder()
                        .propertyName(LeadConstants.UTM_SOURCE)
                        .propertyValue(leadSource.getUtmSource()).build();
                leadAdditionalDetailsList.add(utmSourceDetail);
            }
            if (leadSource.getUtmMedium() != null) {
                LeadAdditionalDetails utmMediumDetail = LeadAdditionalDetails.builder()
                        .propertyName(LeadConstants.UTM_MEDIUM)
                        .propertyValue(leadSource.getUtmMedium()).build();
                leadAdditionalDetailsList.add(utmMediumDetail);
            }
            if (leadSource.getUtmCampaign() != null) {
                LeadAdditionalDetails utmCampaignDetail = LeadAdditionalDetails.builder()
                        .propertyName(LeadConstants.UTM_CAMPAIGN)
                        .propertyValue(leadSource.getUtmCampaign()).build();
                leadAdditionalDetailsList.add(utmCampaignDetail);
            }
            leadAdditionalDetailsService.addDetails(id, leadAdditionalDetailsList);
        }
    }

    private List<String> validateLead(CreateLeadRequestDto createLeadRequestDto) {
        log.info("validating lead");
        List<String> errors = new ArrayList<>();
        leadValidators.forEach(validator -> {
            if (errors.isEmpty()) {
                Optional<String> error = validator.validate(createLeadRequestDto);
                error.ifPresent(errors::add);
            }
        });
        return errors;
    }

    @Override
    public LeadDetailsDto updateLeadBasicDetails(String leadId, UpdateLeadRequestDto updateLeadRequestDto)
            throws Exception {
        log.info("updating basic details req received for lead {} {}", leadId, updateLeadRequestDto);
        Lead existingLead = leadService.fetchLeadByUuid(leadId);
        duplicateIrdaValidator.validate(leadId, updateLeadRequestDto.getIrdaId(),
                updateLeadRequestDto.getIrdaReportingDate());
        duplicateEmailValidator.validate(leadId, updateLeadRequestDto.getEmail());
        Lead updatedLead = leadBasicDetailsMapper.toEntity(updateLeadRequestDto);
        updatedLead.addPiiFields();
        NullAwareBeanUtilsBean.copyNonNullProperties(updatedLead, existingLead);
        if (!existingLead.getStatus().equals(LeadStatus.REGISTERED)) {
            existingLead.decryptAllPiiFields();
            IAMUpdateRequestDto iamReqDto = IAMUpdateRequestDto
                    .builder()
                    .mobile(existingLead.getMobileDecrypted())
                    .email(existingLead.getEmailDecrypted())
                    .name(existingLead.getName())
                    .tenantId(existingLead.getTenantId())
                    .referenceAuthId(updateLeadRequestDto.getReferenceAuthId())
                    .build();
            IAMResponseDto iamResponseDto = iamServiceApiHelper.updateUser(iamReqDto, leadId);
            if (IAMConstants.FALSE.equalsIgnoreCase(iamResponseDto.getStatus())) {
                throw new ForbiddenRequestException(
                        "Error while updating details to IAM: " + iamResponseDto.getMessage());
            }
        }
        log.info("updating lead basic details for leadId {}. lead {}", leadId, existingLead);
        Lead lead = leadBasicDetailsService.addLeadBasicDetails(existingLead);
        lead.decryptAllPiiFields();
        syncLead(lead.getId());
        return leadBasicDetailsMapper.toDto(lead);
    }

    @Override
    public LeadDetailsResponseDto getLeadDetails(@NotNull String leadId) throws Exception {
        log.info("getting lead details for leadId {}", leadId);
        Lead lead = leadService.fetchLeadByUuid(leadId);
        try {
            leadRegisterDocumentService.registerOldDocUrls(lead.getDocuments());
        } catch (Exception e) {
            log.error("error adding tempDocUrl for old lead documents. LeadId: " + leadId);
        }
        return leadBasicDetailsMapper.toLeadDetailsDto(lead);
    }

    @Override
    public LeadDetailsResponseDto updateLeadKyc(String leadId, LeadProfileDto leadProfileDto) throws Exception {
        log.info("updating leadKYC for lead {}", leadId);
        Lead lead = ckycService.updateLeadKyc(leadId, leadProfileDto.getPan(),
                leadProfileDto.getDateOfBirth().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        syncLead(lead.getId());
        return leadBasicDetailsMapper.toLeadDetailsDto(lead);
    }

    @Override
    public LeadFollowupResponseDto updateLeadFollowupDetails(String leadId, LeadFollowupDto leadFollowupDto) {
        log.info("updating followup details for lead {}", leadId);
        LeadFollowup leadFollowup = leadFollowUpMapper.toEntity(leadFollowupDto);
        LeadFollowup updatedLeadFollowUp = leadFollowUpService.updateLeadFollowupDetails(leadId, leadFollowup);
        syncLead(leadFollowup.getLead().getId());
        return leadFollowUpMapper.toDto(updatedLeadFollowUp);
    }

    @SneakyThrows
    @Override
    public LeadProfileDto updateLeadProfile(String leadId, LeadProfileDto leadProfileDto) throws Exception {
        log.info("updating lead profile for lead {}", leadId);
        Optional<String> error = duplicatePanValidator.validate(leadId, leadProfileDto);
        if (error.isPresent()) {
            throw new RuntimeException(error.get());
        }
        panVerificationService.updatePanDetails(leadId, leadProfileDto.getPan());
        LeadProfile leadProfile = leadProfileMapper.toEntity(leadProfileDto);
        leadProfile.addPiiFields();
        LeadProfile newLeadProfile = leadProfileService.updateLeadProfile(leadId, leadProfile);
        transactionManager.executeAfterTransactionCommits(() -> {
            leadSyncService.upsertLeadAsync(newLeadProfile.getId());
            leadSyncService.upsertLeadIrdaiEventAsync(newLeadProfile.getId());
        });
        return leadProfileMapper.toDto(newLeadProfile);
    }

    @Override
    public LeadDocumentDto addLeadDocument(String leadUUID, LeadDocumentDto leadDocumentDto) {
        log.info("adding lead document for lead {}", leadUUID);
        Document document = leadDocumentMapper.toEntity(leadDocumentDto);
        Document updateDocument = leadDocumentsService.addLeadDocument(leadUUID, document);
        syncLead(updateDocument.getLead().getId());
        return leadDocumentMapper.toDto(updateDocument);
    }

    @SneakyThrows
    @Override
    public LeadBankDetailsResponseDto updateLeadBankDetails(String leadUUID, LeadBankDto leadBankDto) {
        log.info("updating lead bank details for lead {}", leadUUID);
        Optional<String> error = duplicateBankValidator.validate(leadUUID, leadBankDto);
        if (error.isPresent()) {
            throw new RuntimeException(error.get());
        }
        BankDetail bankDetail = leadBankMapper.toEntity(leadBankDto);
        bankDetail.addPiiFields();
        BankDetail newBankDetails = leadBankService.updateLeadBankDetails(leadUUID, bankDetail);
        BankVerificationResponseDto bankVerificationResponse = new BankVerificationResponseDto();
        try {
            if (leadBankDto.isDoPennyTesting()) {
                bankVerificationResponse = bankVerificationService.verifyAccount(leadUUID);
            }
        } catch (PennyDropException e) {
            e.printStackTrace();
            log.error("error while penny drop for lead {}", leadUUID);
        }
        boolean isMovedToQC = false;
        if (leadBankDto.getRequestForQC()) {
            log.info("requesting for qc after bank update for lead {}", leadUUID);
            try {
                sendForRegistration(leadUUID);
                isMovedToQC = true;
            } catch (Exception e) {
                e.printStackTrace();
                log.error("error while requesting for qc after bank update for lead {}. Error: {}", leadUUID,
                        e.getMessage());
            }
        } else {
            syncLead(newBankDetails.getLead().getId());
        }
        Lead lead = newBankDetails.getLead();
        newBankDetails = lead.getBankDetails().stream().filter(x -> !x.getIsDeleted()).findFirst().orElse(null);
        LeadBankDetailsResponseDto leadBankDetailsResponseDto = leadBankMapper.toDto(newBankDetails);
        leadBankDetailsResponseDto.setMovedToQC(isMovedToQC);
        leadBankDetailsResponseDto.setMessageFromBank(bankVerificationResponse.getMessageFromBank());
        return leadBankDetailsResponseDto;
    }

    @Override
    public LeadAddressDetailsResponseDto addLeadAddressDetails(String leadUUID,
            LeadAddressRequestDto leadAddressRequestDto) {
        log.info("adding lead address for lead {}", leadUUID);
        List<Address> addressList = leadAddressMapper.toEntity(leadAddressRequestDto.getAddresses());
        List<Address> updatedAddressList = leadAddressService.updateLeadAddressDetails(leadUUID, addressList);
        boolean isMovedToQC = false;
        if (leadAddressRequestDto.getRequestForQC()) {
            log.info("requesting for qc after address update for lead {}", leadUUID);
            try {
                sendForRegistration(leadUUID);
                isMovedToQC = true;
            } catch (Exception e) {
                e.printStackTrace();
                log.error("error while requesting for qc after address update for lead {}. Error: {}", leadUUID,
                        e.getMessage());
            }
        } else {
            syncLead(updatedAddressList.get(0).getLead().getId());
        }
        List<AddressDto> addressDtoList = leadAddressMapper.toDto(updatedAddressList);
        LeadAddressDetailsResponseDto detailsResponseDto = LeadAddressDetailsResponseDto.builder()
                .leadAddressDtoList(addressDtoList)
                .isMovedToQC(isMovedToQC)
                .build();
        return detailsResponseDto;
    }

    @Override
    public void createOrUpdateLeadTrainingStatus(String leadId, LeadTrainingStatusDto leadTrainingStatusDto)
            throws Exception {
        log.info("updating lead training for lead {}", leadId);
        LeadTraining leadTraining = leadTrainingDetailsMapper.toEntity(leadTrainingStatusDto);
        List<LeadTraining> updatedList = leadTrainingService.createOrUpdateLeadTrainingStatus(leadId, leadTraining);
        syncLead(updatedList.get(0).getLead().getId());
    }

    @Override
    public LeadAdditionalDetailsResponseDto addAdditionalDetails(String leadId,
            LeadAdditionalDetailsRequestDto requestDto) {
        log.info("adding lead additional details for lead {}", leadId);
        List<LeadAdditionalDetails> leadAdditionalDetails = leadAdditionalDetailsMapper.toEntity(requestDto.getData());
        List<LeadAdditionalDetails> updatedDetailsList = leadAdditionalDetailsService.addDetails(leadId,
                leadAdditionalDetails);
        List<LeadAdditionalDetailsDto> response = leadAdditionalDetailsMapper.toDto(updatedDetailsList);
        syncLead(updatedDetailsList.get(0).getLead().getId());
        return LeadAdditionalDetailsResponseDto.builder().data(response).build();
    }

    @Override
    public LeadAdditionalDetailsResponseDto getAdditionalDetails(String leadId,
            LeadAdditionalDetailsRequestDto requestDto) {
        log.info("finding lead additional details for lead {}", leadId);
        List<LeadAdditionalDetails> leadAdditionalDetails = leadAdditionalDetailsMapper.toEntity(requestDto.getData());
        List<LeadAdditionalDetails> filteredList = leadAdditionalDetailsService.findDetails(leadId,
                leadAdditionalDetails);
        List<LeadAdditionalDetailsDto> response = leadAdditionalDetailsMapper.toDto(filteredList);
        return LeadAdditionalDetailsResponseDto.builder().data(response).build();
    }

    @Override
    public void updateTrainingStatus() {
        leadTrainingService.fetchRecords(TrainingStatuses.TRAINING_MATERIAL_DOWNLOADED.toString(), 48);
    }

    @Override
    public void checkLeadEligibleForQC(String leadId) throws Exception {
        registrationEventHandler.checkLeadEligibleForQC(leadId);
    }

    private void sendForRegistration(String leadUUID) throws ValidationException {
        registrationEventHandler
                .handle(new LeadStatusEventRequestDto(leadUUID, LeadTrigger.REQUEST_FOR_REGISTRATION, new HashMap<>()));
    }

    @Override
    public LeadDetailsResponseDto fetchLeadAadhaarDetails(String leadId,
            ValidateAadhaarOtpRequestDto submitOtpRequestDto) throws Exception {
        log.info("fetching address details for lead {}", leadId);
        Lead lead = aadhaarService.fetchLeadAadhaarDetails(leadId, submitOtpRequestDto);
        syncLead(lead.getId());
        return leadBasicDetailsMapper.toLeadDetailsDto(lead);
    }

}
