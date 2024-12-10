package com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leadonboardingservice.leadonboardingservice.dtos.ChannelPartnerPropertiesDto;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.*;
import com.leadonboardingservice.leadonboardingservice.exceptions.DownstreamAPIException;
import com.leadonboardingservice.leadonboardingservice.externals.BrokerageMasterApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.ChannelPartnerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.helpers.CommonUtils;
import com.leadonboardingservice.leadonboardingservice.helpers.IamContextUtils;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.ChannelPartnerRequestDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.MasterTenantConfigResponseDto.TenantConfigDto;
import com.leadonboardingservice.leadonboardingservice.models.*;
import com.leadonboardingservice.leadonboardingservice.helpers.TransactionManagerImpl;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadService;
import com.leadonboardingservice.leadonboardingservice.services.PosUserService;
import com.leadonboardingservice.leadonboardingservice.validators.ConvertLeadValidator;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;

import java.time.*;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class LeadConvertEventHandler implements LeadEventHandler{
    private final LeadService leadService;
    private final List<ConvertLeadValidator> leadValidators;
    private final ChannelPartnerServiceApiHelper channelPartnerServiceApiHelper;
    private final AsyncEsSyncService leadSyncService;
    private final PosUserService posUserService;
    private final IamContextUtils iamContextUtils;
    private final TransactionManagerImpl transactionManager;
    private final BrokerageMasterApiHelper brokerageMasterApiHelper;
    @SneakyThrows
    @Override
    public void handle(LeadStatusEventRequestDto leadRequest) {
        try {
            log.info("inside lead LeadConvertEventHandler for leadId {}", leadRequest.getLeadId());
            Lead lead = leadService.fetchLeadByUuid(leadRequest.getLeadId());
            lead.decryptAllPiiFields();
            List<String> errors = validateLead(lead);
            if (!errors.isEmpty()) {
                throw new RuntimeException(String.valueOf(errors));
            }
            ChannelPartnerDto channelPartnerResponseDto = convertLead(lead);
            Optional<User> user = posUserService.createUserInPos(channelPartnerResponseDto, lead);
            transactionManager.executeAfterTransactionCommits(() -> {
                leadSyncService.upsertLeadAsync(lead.getId());
                leadSyncService.upsertPosUserCreationAsync(channelPartnerResponseDto.getGcdCode());
            });
        }catch (Exception e){
            e.printStackTrace();
            log.error("error while converting lead to channel partner for lead {}",leadRequest.getLeadId());
            throw new RuntimeException("Unable to create user. "+e.getMessage());
        }
    }

    private ChannelPartnerDto convertLead(Lead lead) throws JsonProcessingException, DownstreamAPIException {
        log.info("converting lead {}",lead.getUuid());
        Map<AddressTypes, Address> addressMap = CommonUtils.convertListToMap(
                lead.getAddress(),
                Address::getType
        );
        if (!addressMap.containsKey(AddressTypes.WORK) || !addressMap.containsKey(AddressTypes.HOME)) {
            throw new IllegalArgumentException("Address details are missing.");
        }
        Optional<BankDetail> optionalBankDetail = getActiveBankDetail(lead.getBankDetails());
        if(optionalBankDetail.isEmpty()){
            throw new NoSuchElementException("Bank Account Verification Error: Bank Not Verified");
        }
        lead.getAddress().forEach(BaseEntity::decryptAllPiiFields);
        optionalBankDetail.ifPresent(BaseEntity::decryptAllPiiFields);
        BankDetail bankDetail = optionalBankDetail.get();
        List<TenantConfigDto> tenantConfig = brokerageMasterApiHelper.getTenantConfig(lead.getTenantId());
        String channelPartnerType = lead.getTenantId() != 1 && !tenantConfig.isEmpty()
                ? tenantConfig.get(0).getSource()
                : "AGENCY";
        ChannelPartnerPropertiesDto channelPartnerProperties = new ChannelPartnerPropertiesDto();
        channelPartnerProperties.setLeadCreationDate(lead.getCreatedAt().atZone(ZoneOffset.UTC).toInstant().toString());
        ChannelPartnerRequestDto channelPartnerRequestDto = ChannelPartnerRequestDto.builder()
                .name(lead.getName())
                .status(1)
                .source("POS")
                .employmentType("2")
                .tenantId(lead.getTenantId())
                .channelPartnerType(channelPartnerType)
                .panCard(lead.getLeadProfile().getPanDecrypted())
                .panCardEncrypted(lead.getLeadProfile().getPanEncrypted())
                .panCardMasked(lead.getLeadProfile().getPanMasked())
                .address(addressMap.get(AddressTypes.HOME).getAddress())
                .cityId(addressMap.get(AddressTypes.HOME).getCityId())
                .stateId(addressMap.get(AddressTypes.HOME).getStateId())
                .pinCode(addressMap.get(AddressTypes.HOME).getPincode())
                .workAddress(addressMap.get(AddressTypes.WORK).getAddress())
                .workPinCode(addressMap.get(AddressTypes.WORK).getPincode())
                .workCityId(addressMap.get(AddressTypes.WORK).getCityId())
                .createdBy(getCreatedBy())
                .email(lead.getEmailDecrypted())
                .emailEncrypted(lead.getEmailEncrypted())
                .emailMasked(lead.getEmailMasked())
                .mobile(lead.getMobileDecrypted())
                .mobileMasked(lead.getMobileMasked())
                .mobileEncrypted(lead.getMobileEncrypted())
                .dateOfBirth(lead.getLeadProfile().getDateOfBirth())
                .irdaId(lead.getIrdaId())
                .iamUUID(lead.getUuid())
                .bankId(bankDetail.getBankName())
                .accountNumber(bankDetail.getAccountNumberDecrypted())
                .accountNumberEncrypted(bankDetail.getAccountNumberEncrypted())
                .ifsc(bankDetail.getIfsc())
                .isJointBankAccount(bankDetail.getIsJointAccount() ? 1 : 0)
                .organization(lead.getName())
                .beneficiaryId(lead.getBankDetails().get(0).getBeneficiaryId())
                .beneficiaryName(lead.getBankDetails().get(0).getBeneficiaryName())
                .properties(channelPartnerProperties)
                .build();
        if(lead.getAddress()!= null && !lead.getAddress().isEmpty() && !StringUtils.isEmpty(lead.getAddress().get(0).getGstNumber())){
            channelPartnerRequestDto.setGstNumber(lead.getAddress().get(0).getGstNumber());
        }
        if (lead.getLeadAdditionalDetails() != null) {
            Optional<LeadAdditionalDetails> leadGender = lead.getLeadAdditionalDetails().stream()
                    .filter(i -> i.getPropertyName().equals(LeadConstants.GENDER)).findFirst();
            leadGender.ifPresent(additionalDetails -> channelPartnerRequestDto.setGender(additionalDetails.getPropertyValue()));
        }
        if(lead.getIrdaId() == null || lead.getIrdaId().isEmpty()){
            channelPartnerRequestDto.setGeneralOnboardingDate(LocalDateTime.now().toString());
            channelPartnerRequestDto.setOnBoardedOnGeneral(true);
        } else if(lead.getLeadTrainings() != null){
            lead.getLeadTrainings().forEach(leadTraining -> {
                if(leadTraining.getStatus().equals(TrainingStatuses.COMPLETED)){
                    if(leadTraining.getProduct().equals(InsuranceProduct.GENERAL)){
                        channelPartnerRequestDto.setGeneralOnboardingDate(LocalDateTime.now().toString());
                        channelPartnerRequestDto.setOnBoardedOnGeneral(true);
                    }
                    if(leadTraining.getProduct().equals(InsuranceProduct.LIFE)){
                        channelPartnerRequestDto.setLifeOnboardingDate(LocalDateTime.now().toString());
                        channelPartnerRequestDto.setOnBoardedOnLife(true);
                    }
                }
            });
        }
        try {
            if (!StringUtils.isEmpty(lead.getReferrerIamUuid())) {
                log.info("fetching rap cps id for lead {} ", lead.getUuid());
                ChannelPartnerDto channelPartnerResponseDto = channelPartnerServiceApiHelper.getByChannelPartnerIamId(lead.getReferrerIamUuid());
                channelPartnerRequestDto.setReferrerCpsId(channelPartnerResponseDto.getChannelPartnerId());
            } else if (!StringUtils.isEmpty(lead.getAssignedSalesIamUuid())) {
                log.info("fetching rm details for lead {}", lead.getUuid());
                channelPartnerRequestDto.setRmIamUuid(lead.getAssignedSalesIamUuid());
            } else {
                log.warn("lead is not assigned to sales or dealer");
            }
        }catch (Exception e){
            e.printStackTrace();
            log.warn("error while fetching rm details for lead {}. {}",lead.getUuid(),e.getMessage());
        }
        try {
            ChannelPartnerDto channelPartnerResponseDto;
            if (!StringUtils.isEmpty(lead.getChannelPartnerId()))  {
                channelPartnerRequestDto.setChannelPartnerId(lead.getChannelPartnerId());
                channelPartnerResponseDto = channelPartnerServiceApiHelper.updateChannelPartner(channelPartnerRequestDto);
                log.info("lead updated to channelPartner for iamUUID {}. setting lead status to registered", lead.getUuid());
            } else {
                channelPartnerResponseDto = channelPartnerServiceApiHelper.createChannelPartner(channelPartnerRequestDto);
                log.info("lead converted to channelPartner for iamUUID {}. setting lead status to registered", lead.getUuid());
            }
            lead.setStatus(LeadStatus.REGISTERED);
            lead.setChannelPartnerId(channelPartnerResponseDto.getChannelPartnerId());
            return channelPartnerResponseDto;
        } catch (Exception e){
            log.error("error while creating channel partner "+e.getMessage());
            if(e instanceof HttpStatusCodeException) {
                String message="";
                String errorResponse = ((HttpStatusCodeException) e).getResponseBodyAsString();
                ObjectMapper objectMapper=new ObjectMapper();
                JsonNode errorNode = objectMapper.readValue(errorResponse, JsonNode.class);
                if(errorNode.get("errors") != null) {
                    message = errorNode.get("errors").get(0).get("message").asText();
                }
                throw new DownstreamAPIException(message);
            }
        }
        throw new RuntimeException("Some error occurred while converting lead");
    }

    private Optional<BankDetail> getActiveBankDetail(List<BankDetail> bankDetailList){
        return bankDetailList.stream().filter(x -> x.getIsActive() && x.getIsBankVerified()).findFirst();
    }

    private String getCreatedBy() {
        Optional<String> iamUUID = iamContextUtils.getIamUUID();
        return iamUUID.orElse("");
    }

    private List<String> validateLead(Lead lead) {
        log.info("validating lead details before creating channel partner for lead {}",lead.getUuid());
        List<String> errors = new ArrayList<>();
        leadValidators.forEach(validator -> {
            Optional<String> error = validator.validate(lead);
            error.ifPresent(errors::add);
        });
        return errors;
    }

    @Override
    public LeadTrigger getName() {
        return LeadTrigger.CONVERT_LEAD;
    }

}
