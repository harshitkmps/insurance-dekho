package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.LSQFieldsDto;
import com.leadonboardingservice.leadonboardingservice.dtos.LSQLeadActivityDto;
import com.leadonboardingservice.leadonboardingservice.dtos.LSQLeadDetailsDto;
import com.leadonboardingservice.leadonboardingservice.dtos.LSQLeadDto;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import com.leadonboardingservice.leadonboardingservice.enums.LSQLeadDetailAttribute;
import com.leadonboardingservice.leadonboardingservice.enums.LeadOriginMethods;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.externals.BrokerageMasterApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.ChannelPartnerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.SalesProfileServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.SalesPersonDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.BrokerageAreaResponseDto;
import com.leadonboardingservice.leadonboardingservice.helpers.ESUtils;
import com.leadonboardingservice.leadonboardingservice.models.*;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class LSQMapperServiceImpl {

    private final LeadRepository leadRepository;
    private final BrokerageMasterApiHelper brokerageMasterApiHelper;
    private final ChannelPartnerServiceApiHelper channelPartnerServiceApiHelper;
    private final SalesProfileServiceApiHelper salesProfileServiceApiHelper;
    @Value("#{'${ide.lsq.allowedRms:}'.split(',')}")
    private final List<String> allowedRMList = new ArrayList<>();

    public LSQLeadDto mapLead(Long leadId){
        log.info("mapping leadId {} for lsq ",leadId);
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new RuntimeException("lead not found with leadId "+leadId));
        if(lead.getTenantId() != 1 || lead.getLeadOriginatedBy().equals(LeadOriginMethods.DEALER)) {
            return null;
        }
        //temp check
        if(!lead.getLeadOriginatedBy().equals(LeadOriginMethods.SELF) && StringUtils.isEmpty(lead.getReferrerIamUuid())) {
            if (allowedRMList.stream().noneMatch(x -> x.equals(lead.getAssignedSalesIamUuid()))){
                return null;
            }
        }
        lead.decryptAllPiiFields();
        List<LSQLeadDetailsDto> leadDetailsDtoList = buildLSQLeadDetailsList(lead);
        LSQLeadActivityDto lsqLeadActivity = buildLSQLeadActivity(lead);
        return new LSQLeadDto(leadDetailsDtoList,lsqLeadActivity);
    }

    private LSQLeadActivityDto buildLSQLeadActivity(Lead lead) {
        List<LSQFieldsDto> lsqFieldsDtoList = new ArrayList<>();
        List<Document> leadDocuments = lead.getDocuments();
        if(lead.getBankDetails() != null && !lead.getBankDetails().isEmpty()) {
            BankDetail bankDetail = lead.getBankDetails().get(0);
            String bankDetailsPresent = "No";
            if(bankDetail != null && bankDetail.getIsBankVerified() != null && bankDetail.getIsBankVerified()) {
                bankDetailsPresent = "Yes";
            }
            LSQFieldsDto bankFieldDto = LSQFieldsDto.builder().schemaName(LSQLeadDetailAttribute.BANK_DETAILS.getAttribute()).value(bankDetailsPresent).build();
            lsqFieldsDtoList.add(bankFieldDto);
        }
        List<String> documentTypeList = Stream.of(DocumentType.values()).map(DocumentType::name).collect(Collectors.toList());
        documentTypeList.forEach(type -> {
            try {
                String uploadStatus = "NOT_UPLOADED";
                if (leadDocuments != null) {
                    Optional<Document> optionalDocument = leadDocuments.stream().filter(document -> document.getType().toString().equals(type)).findFirst();
                    if (optionalDocument.isPresent()) {
                        uploadStatus = "UPLOADED";
                    }
                }
                LSQFieldsDto fieldsDto = LSQFieldsDto.builder().schemaName(LSQLeadDetailAttribute.getSchemaName(type)).value(uploadStatus).build();
                lsqFieldsDtoList.add(fieldsDto);
            }catch (Exception e){
                log.error("Error while creating doc field {}", e.getMessage());
            }
        });
        return LSQLeadActivityDto.builder().activityEvent(201).activityNote("Activity Updated").lsqFieldsDtoList(lsqFieldsDtoList).build();
    }

    private List<LSQLeadDetailsDto> buildLSQLeadDetailsList(Lead lead) {
        List<LSQLeadDetailsDto> leadDetailsDtoList = new ArrayList<>();
        if(lead.getCityId() != null){
            try {
                BrokerageAreaResponseDto.BrokerageAreaDto cityResponse = brokerageMasterApiHelper.getAreaDetailsByCityId(String.valueOf(lead.getCityId()));
                LSQLeadDetailsDto lsqLeadDetailsCityDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.MX_CITY.getAttribute()).value(cityResponse.getCityName()).build();
                LSQLeadDetailsDto lsqLeadDetailsStateDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.MX_STATE.getAttribute()).value(cityResponse.getStateName()).build();
                leadDetailsDtoList.add(lsqLeadDetailsCityDto);
                leadDetailsDtoList.add(lsqLeadDetailsStateDto);
            }catch (Exception e){
                e.printStackTrace();
            }
        }
        if(!StringUtils.isEmpty(lead.getName())) {
            LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.FIRST_NAME.getAttribute()).value(lead.getName()).build();
            leadDetailsDtoList.add(lsqLeadDetailsDto);
        }
        if(lead.getStatus().equals(LeadStatus.REGISTERED)){
            try {
                ChannelPartnerDto channelPartnerDto = channelPartnerServiceApiHelper.getByChannelPartnerIamId(lead.getUuid());
                LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.MX_GCD_CODE.getAttribute()).value(channelPartnerDto.getGcdCode()).build();
                leadDetailsDtoList.add(lsqLeadDetailsDto);
            }catch (Exception e){
                e.printStackTrace();
            }
        }
        if(!StringUtils.isEmpty(lead.getEmailDecrypted())) {
            LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.EMAIL.getAttribute()).value(lead.getEmailDecrypted()).build();
            leadDetailsDtoList.add(lsqLeadDetailsDto);
        }
        if(!StringUtils.isEmpty(lead.getMobileDecrypted())) {
            LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.Phone.getAttribute()).value(lead.getMobileDecrypted()).build();
            leadDetailsDtoList.add(lsqLeadDetailsDto);
        }
        if(lead.getLeadAdditionalDetails() != null) {
            Map<String, String> leadDetailsMap = lead.getLeadAdditionalDetails()
                    .stream()
                    .collect(Collectors.toMap(LeadAdditionalDetails::getPropertyName, LeadAdditionalDetails::getPropertyValue,(oldkey,newkey) -> {
                        log.info("Duplicate key found in additional details ");
                        return newkey;
                    }));
            String utmSource = leadDetailsMap.get(LeadConstants.UTM_SOURCE);
            String utmMedium = leadDetailsMap.get(LeadConstants.UTM_MEDIUM);
            String utmCampaign = leadDetailsMap.get(LeadConstants.UTM_CAMPAIGN);

            if(utmSource!=null) {
                LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.SOURCE.getAttribute()).value(utmSource).build();
                leadDetailsDtoList.add(lsqLeadDetailsDto);
            }
            if(utmMedium!=null) {
                LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.MEDIUM.getAttribute()).value(utmMedium).build();
                leadDetailsDtoList.add(lsqLeadDetailsDto);
            }
            if(utmCampaign!=null) {
                LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.CAMPAIGN.getAttribute()).value(utmCampaign).build();
                leadDetailsDtoList.add(lsqLeadDetailsDto);
            }
        }
        if(lead.getLeadOriginatedBy() != null) {
            LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.MX_POS_ORIGIN.getAttribute()).value(ESUtils.mapLeadOriginToLSQ(lead.getLeadOriginatedBy())).build();
            leadDetailsDtoList.add(lsqLeadDetailsDto);
        }
        if(lead.getId() != null) {
            LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.MX_LEAD_ID.getAttribute()).value(String.valueOf(lead.getOldLeadId() != null ? lead.getOldLeadId() : lead.getId())).build();
            leadDetailsDtoList.add(lsqLeadDetailsDto);
        }
        if(lead.getStatus() != null) {
            LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.PROSPECT_STAGE.getAttribute()).value(ESUtils.mapLeadStateToLSQ(lead.getStatus())).build();
            if(lead.getStatus().equals(LeadStatus.CREATED) && lead.getLeadFollowups() != null){
                Optional<LeadFollowup> leadFollowup = lead.getLeadFollowups().stream().filter(LeadFollowup::getIsActive).findFirst();
                if(leadFollowup.isPresent()) {
                    lsqLeadDetailsDto.setValue("Follow Up");
                }
            }
            LSQLeadDetailsDto lsqRejectCommentDto;
            if(lead.getStatus().equals(LeadStatus.REJECTED)) {
                lsqRejectCommentDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.REJECTION_REMARK.getAttribute()).value(lead.getRejectionReason()).build();
            } else {
                lsqRejectCommentDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.REJECTION_REMARK.getAttribute()).value("").build();
            }
            leadDetailsDtoList.add(lsqRejectCommentDto);
            leadDetailsDtoList.add(lsqLeadDetailsDto);
        }
        if(!StringUtils.isEmpty(lead.getUuid())) {
            LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.MX_UUID.getAttribute()).value(lead.getUuid()).build();
            leadDetailsDtoList.add(lsqLeadDetailsDto);
        }
        if(!StringUtils.isEmpty(lead.getAssignedSalesIamUuid())) {
            LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.MX_ASSIGNED_RM_UUID.getAttribute()).value(lead.getAssignedSalesIamUuid()).build();
            leadDetailsDtoList.add(lsqLeadDetailsDto);
            try {
                SalesPersonDto salesPersonDto = salesProfileServiceApiHelper.getBySalesPersonIamId(lead.getAssignedSalesIamUuid());
                LSQLeadDetailsDto lsqLeadDetailsSalesDto = LSQLeadDetailsDto.builder().attribute(LSQLeadDetailAttribute.CREATED_BY_NAME.getAttribute()).value(salesPersonDto.getName()).build();
                leadDetailsDtoList.add(lsqLeadDetailsSalesDto);
            }catch (Exception e){
                e.printStackTrace();
            }
        }
        LSQLeadDetailsDto lsqLeadDetailsDto = LSQLeadDetailsDto.builder().attribute("SearchBy").value("mx_UUID").build();
        leadDetailsDtoList.add(lsqLeadDetailsDto);
        return leadDetailsDtoList;
    }
}
