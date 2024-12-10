package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.config.EsLeadEventsMapConfig;
import com.leadonboardingservice.leadonboardingservice.constants.ESConstants;
import com.leadonboardingservice.leadonboardingservice.enums.InsuranceProduct;
import com.leadonboardingservice.leadonboardingservice.enums.LeadEvent;
import com.leadonboardingservice.leadonboardingservice.enums.LeadOriginMethods;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.externals.ChannelPartnerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.SalesProfileServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.SalesAgentsDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.SalesPersonDto;
import com.leadonboardingservice.leadonboardingservice.helpers.ESUtils;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadAdditionalDetails;
import com.leadonboardingservice.leadonboardingservice.models.LeadFollowup;
import com.leadonboardingservice.leadonboardingservice.models.Remarks;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.RemarksRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@Transactional(propagation = Propagation.REQUIRES_NEW)
@RequiredArgsConstructor
public class EsLeadMapperServiceImpl {

    private final LeadRepository leadRepository;
    private final ChannelPartnerServiceApiHelper channelPartnerServiceApiHelper;
    private final SalesProfileServiceApiHelper salesProfileServiceApiHelper;
    private final RemarksRepository remarksRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private final EsLeadEventsMapConfig esLeadEventsMapConfig;

    public com.leadonboardingservice.leadonboardingservice.models.es.Lead mapLead(Long leadId) {
        log.info("mapping lead in ES for leadId {} ",leadId);
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new RuntimeException("lead not found with leadId "+leadId));
        return mapLead(lead);
    }

    public com.leadonboardingservice.leadonboardingservice.models.es.Lead mapLead(Lead lead) {
        log.info("transforming lead details for leadId {}", lead.getUuid());
        com.leadonboardingservice.leadonboardingservice.models.es.Lead esLead = new com.leadonboardingservice.leadonboardingservice.models.es.Lead();
        if(lead.getOldLeadId() != null){
            log.info("setting old leadId {} as primary id for leadId {}",lead.getOldLeadId(),lead.getId());
            esLead.setId(lead.getOldLeadId());
        } else {
            esLead.setId(lead.getId());
        }
        esLead.setUuid(lead.getUuid());
        esLead.setIrdaId(lead.getIrdaId());
        esLead.setMobileEncrypted(lead.getMobileEncrypted());
        esLead.setMobileHash(lead.getMobileHashed());
        esLead.setMobileMask(lead.getMobileMasked());
        esLead.setEmailEncrypted(lead.getEmailEncrypted());
        esLead.setEmailHash(lead.getEmailHashed());
        esLead.setEmailMask(lead.getEmailMasked());
        esLead.setName(lead.getName());
        if(lead.getLeadOrigin()!=null)
            esLead.setLeadOrigin(lead.getLeadOrigin().toString());
        esLead.setLeadOwnerIamUUID(lead.getAssignedSalesIamUuid());
        esLead.setLeadCreatorIamUUID(lead.getCreatedBy());
        if(lead.getStatus()!=null) {
            esLead.setLeadState(ESUtils.mapLeadState(lead.getStatus()));
            if(lead.getStatus().equals(LeadStatus.CREATED) && lead.getLeadFollowups() != null){
                Optional<LeadFollowup> leadFollowup = lead.getLeadFollowups().stream().filter(LeadFollowup::getIsActive).findFirst();
                if(leadFollowup.isPresent()) {
                    esLead.setLeadState(ESConstants.FOLLOW_UP);
                }
            }
        }
        if(lead.getStatus().equals(LeadStatus.CLOSED) && lead.getClosedStatusRemarkId() != null){
            Optional<Remarks> remark = remarksRepository.findById(Long.valueOf(lead.getClosedStatusRemarkId()));
            log.info("adding lead close remark reason for lead {}",lead.getUuid());
            remark.ifPresent(remarks -> esLead.setLeadCloseReason(remarks.getText()));
        }
        if(lead.getStatus().equals(LeadStatus.REJECTED)){
            log.info("adding lead reject reason for lead {}",lead.getUuid());
            esLead.setLeadRejectionReason(lead.getRejectionReason());
        }

        ObjectNode generalInsuranceReg = objectMapper.createObjectNode();
        ObjectNode lifeInsuranceReg = objectMapper.createObjectNode();
        ObjectNode leadHistory = objectMapper.createObjectNode();

        if(lead.getLeadEvents() != null && !lead.getLeadEvents().isEmpty()){
            Map<LeadEvent, String> leadEventsToStoreInEs = esLeadEventsMapConfig.getLeadEventsToStoreInEs();
            lead.getLeadEvents().forEach(leadEvent -> {
                try{
                    LeadEvent eventKey = LeadEvent.valueOf(leadEvent.getEvent());
                    if(leadEventsToStoreInEs.containsKey(eventKey)) {
                        ObjectNode leadEventData = objectMapper.createObjectNode();
                        leadEventData.put("timestamp",String.valueOf(leadEvent.getTimeStamp()));
                        leadEventData.put("created_by", leadEvent.getCreatedBy());
                        leadHistory.set(String.valueOf(leadEventsToStoreInEs.get(eventKey)), leadEventData);
                    }
                }catch (IllegalArgumentException e){
                    log.debug("Event not present in LeadEvent: : {}, message: {}", leadEvent.getEvent(), e.getMessage());
                }
            });
            esLead.setLeadHistory(leadHistory);
        }

        if(lead.getLeadTrainings() != null && !lead.getLeadTrainings().isEmpty()) {
            lead.getLeadTrainings().forEach(leadTraining -> {
                if (leadTraining.getProduct()!=null && leadTraining.getProduct().equals(InsuranceProduct.GENERAL)) {
                    generalInsuranceReg.put(ESConstants.EXAM_STATUS, ESUtils.mapExamStatus(leadTraining.getStatus()));
                    if(!StringUtils.isEmpty(lead.getIrdaId())){
                        generalInsuranceReg.put(ESConstants.IS_IRDA_REGISTERED, "irda_registered");
                    }
                    if(leadTraining.getUpdatedAt() != null) {
                        generalInsuranceReg.put(ESConstants.LAST_UPDATED, String.valueOf(leadTraining.getUpdatedAt()));
                    }
                    esLead.setGeneralInsuranceReg(generalInsuranceReg);
                }
                if (leadTraining.getProduct()!=null && leadTraining.getProduct().equals(InsuranceProduct.LIFE)) {
                    lifeInsuranceReg.put(ESConstants.EXAM_STATUS, ESUtils.mapExamStatus(leadTraining.getStatus()));
                    if(!StringUtils.isEmpty(lead.getIrdaId())){
                        lifeInsuranceReg.put(ESConstants.IS_IRDA_REGISTERED, "irda_registered");
                    }
                    if(leadTraining.getUpdatedAt() != null) {
                        lifeInsuranceReg.put(ESConstants.LAST_UPDATED, String.valueOf(leadTraining.getUpdatedAt()));
                    }
                    esLead.setLifeInsuranceReg(lifeInsuranceReg);
                }
            });
        }
        if(esLead.getLeadState().equals(ESConstants.REG_REQUESTED) || esLead.getLeadState().equals(ESConstants.REGISTERED)){
            if(esLead.getGeneralInsuranceReg() == null) {
                generalInsuranceReg.put(ESConstants.EXAM_STATUS, ESConstants.STUDY_LINK_PENDING);
                esLead.setGeneralInsuranceReg(generalInsuranceReg);
            }
            if(esLead.getLifeInsuranceReg() == null) {
                lifeInsuranceReg.put(ESConstants.EXAM_STATUS, ESConstants.STUDY_LINK_PENDING);
                esLead.setLifeInsuranceReg(lifeInsuranceReg);
            }
        }
        if (lead.getLeadAdditionalDetails() != null) {
            Optional<LeadAdditionalDetails> leadAdditionalDetails = lead.getLeadAdditionalDetails().stream().filter(i -> i.getPropertyName().equals(ESConstants.UTM_SOURCE)).findFirst();
            leadAdditionalDetails.ifPresent(additionalDetails -> esLead.setUtmSource(additionalDetails.getPropertyValue()));
        }
        esLead.setLeadOrigin(ESUtils.mapLeadOrigin(lead.getLeadOriginatedBy()));
        esLead.setCreatedAt(lead.getCreatedAt().toString());
        esLead.setUpdatedAt(lead.getUpdatedAt().toString());
        esLead.setTenantId(lead.getTenantId());
        if (lead.getLeadAdditionalDetails() != null) {
            Optional<LeadAdditionalDetails> migrationDetails = lead.getLeadAdditionalDetails().stream().filter(i -> i.getPropertyName().equals(ESConstants.RE_REGISTER)).findFirst();
            migrationDetails.ifPresent(additionalDetails -> {
                esLead.setCreatedAt(additionalDetails.getCreatedAt().toString());
                esLead.setReRegister(additionalDetails.getPropertyValue().equals("1"));
            });
            Optional<LeadAdditionalDetails> nocDetails = lead.getLeadAdditionalDetails().stream().filter(i -> i.getPropertyName().equals(ESConstants.NOC_REQ)).findFirst();
            nocDetails.ifPresent(additionalDetails -> esLead.setNocRequired(additionalDetails.getPropertyValue().equals("1")));
        }

        if(!StringUtils.isEmpty(lead.getReferrerIamUuid())) {
            log.info("build path for rap lead iamUUID {}",lead.getUuid());
            addHierarchyForReferrerLead(lead.getUuid(),lead.getReferrerIamUuid(),esLead);
            esLead.setReferDealerId(getReferDealerId(lead.getReferrerIamUuid()));
            esLead.setLeadOwnerIamUUID(lead.getReferrerIamUuid());
        }
        if(lead.getStatus().equals(LeadStatus.REGISTERED)){
            ChannelPartnerDto channelPartnerDto = channelPartnerServiceApiHelper.getByChannelPartnerIamId(lead.getUuid());
            esLead.setDealerId(String.valueOf(channelPartnerDto.getDealerId()));
            esLead.setGcdCode(channelPartnerDto.getGcdCode());
            esLead.setPosCreationDate(String.valueOf(channelPartnerDto.getCreated()));
            esLead.setCityId(channelPartnerDto.getCityId());
            esLead.setIrdaReportingDate(lead.getIrdaReportingDate() != null ? lead.getIrdaReportingDate().toString() : null);
            if(StringUtils.isEmpty(lead.getReferrerIamUuid())) {
                addHierarchyForLead(lead.getUuid(),lead.getAssignedSalesIamUuid(),esLead);
            }
        } else if(!StringUtils.isEmpty(lead.getAssignedSalesIamUuid())){
            esLead.setPath(lead.getAssignedSalesIamUuid());
            if(lead.getTenantId() ==1 && (lead.getLeadOriginatedBy().equals(LeadOriginMethods.SALES) ||
                    lead.getLeadOriginatedBy().equals(LeadOriginMethods.SELF))){
                log.info("build path for lead iamUUID {}",lead.getUuid());
                addHierarchyForLead(lead.getUuid(),lead.getAssignedSalesIamUuid(),esLead);
            }
        }
        log.info("ES lead mapped {}", esLead);
        return esLead;
    }

    private void addHierarchyForReferrerLead(String uuid, String assignedSalesIamUuid, com.leadonboardingservice.leadonboardingservice.models.es.Lead esLead) {
        try {
            ChannelPartnerDto channelPartnerDto = channelPartnerServiceApiHelper.getByChannelPartnerIamId(assignedSalesIamUuid);
            log.info("Es sales agent list for channel partner {} {}", channelPartnerDto.getIamUUID(), channelPartnerDto.getSalesAgents());
            StringBuilder path = new StringBuilder(channelPartnerDto.getIamUUID());
            if (channelPartnerDto.getSalesAgents() != null && !channelPartnerDto.getSalesAgents().isEmpty()) {
               channelPartnerDto.getSalesAgents().forEach((key, salesAgentsList) -> salesAgentsList.forEach(salesAgent -> path.append(",").append(salesAgent.getIamUUID())));
            }
            log.info("Es path build for the lead {} {}",esLead.getId(), path);
            esLead.setPath(path.toString());
            addHierarchyDetails(channelPartnerDto,esLead);
        }catch (Exception e){
            e.printStackTrace();
            log.error("error while updating referrer path in Es for lead {}. checking if sales uuid is assigned to sales person",esLead.getId());
            addHierarchyForLead(uuid,assignedSalesIamUuid, esLead);
        }
    }

    private void addHierarchyDetails(ChannelPartnerDto channelPartnerDto, com.leadonboardingservice.leadonboardingservice.models.es.Lead esLead) {
        try {
            Map<String, com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData> userReportingDataMap = new HashMap<>();
            if (channelPartnerDto.getSalesAgents() != null) {
                channelPartnerDto.getSalesAgents().forEach((key, salesAgentsList) -> salesAgentsList.forEach(salesAgentsDto -> {
                    com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData userReportingData = new com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData();
                    userReportingData.setName(salesAgentsDto.getName());
                    userReportingData.setEmail(salesAgentsDto.getEmail());
                    String designation = getDesignation(salesAgentsDto.getDesignationSlug());
                    userReportingDataMap.put(designation, userReportingData);
                }));
                com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData userReportingData = new com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData();
                userReportingData.setName(channelPartnerDto.getName());
                userReportingData.setEmail(channelPartnerDto.getEmail());
                userReportingData.setGcdCode(channelPartnerDto.getGcdCode());
                userReportingDataMap.put(ESConstants.MASTER_DETAILS,userReportingData);

                SalesAgentsDto assigneeDetails = channelPartnerDto.getSalesAgents()
                        .values()
                        .stream()
                        .filter(salesAgentList -> !salesAgentList.isEmpty())
                        .findFirst()
                        .map(salesAgentList -> salesAgentList.get(0))
                        .orElse(null);

                if(assigneeDetails!=null) {
                    com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData userReportingSalesData = new com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData();
                    userReportingSalesData.setName(assigneeDetails.getName());
                    userReportingSalesData.setEmail(assigneeDetails.getEmail());
                    userReportingDataMap.put(ESConstants.ASSIGNEE_DETAILS,userReportingSalesData);
                }
                esLead.setHierarchyDetails(userReportingDataMap);
            }
        }catch (Exception e){
            e.printStackTrace();
            log.error("unable to add addHierarchyDetailsForReferrerLead in Es for lead {}",esLead.getId());
        }
    }

    private String getDesignation(@NotNull String designationSlug) {
        if (designationSlug.equalsIgnoreCase("business_manager")){
            return "relationship_manager";
        }
        return designationSlug;
    }

    private void addHierarchyForLead(String uuid, String assignedSalesIamUuid, com.leadonboardingservice.leadonboardingservice.models.es.Lead esLead) {
        try {
            SalesPersonDto salesPersonDto = salesProfileServiceApiHelper.getBySalesPersonIamId(assignedSalesIamUuid);
            log.info("Es agent list for sales person partner {} {}", assignedSalesIamUuid, salesPersonDto.getSalesAgentsHierarchy());
            StringBuilder path = new StringBuilder(assignedSalesIamUuid);
            if (salesPersonDto.getSalesAgentsHierarchy() != null && !salesPersonDto.getSalesAgentsHierarchy().isEmpty()) {
                salesPersonDto.getSalesAgentsHierarchy().forEach((key, salesAgentsList) -> salesAgentsList.forEach(salesAgent -> path.append(",").append(salesAgent.getIamUUID())));
            }
            log.info("Es path build for the lead {} {}",esLead.getId(), path);
            esLead.setPath(path.toString());
            addHierarchyDetails(salesPersonDto,esLead);
        }catch (Exception e){
            e.printStackTrace();
            log.error("error while updating sales path in Es for lead {}",esLead.getId());
        }
    }

    private void addHierarchyDetails(SalesPersonDto salesPersonDto, com.leadonboardingservice.leadonboardingservice.models.es.Lead esLead) {
        try {
            Map<String, com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData> userReportingDataMap = new HashMap<>();
            if (salesPersonDto.getSalesAgentsHierarchy() != null) {
                salesPersonDto.getSalesAgentsHierarchy().forEach((key, salesAgentsList) -> salesAgentsList.forEach(salesAgentsDto -> {
                    com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData userReportingData = new com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData();
                    userReportingData.setName(salesAgentsDto.getName());
                    userReportingData.setEmail(salesAgentsDto.getEmail());
                    String designation = getDesignation(salesAgentsDto.getDesignationSlug());
                    userReportingDataMap.put(designation, userReportingData);
                }));
                com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData userReportingData = new com.leadonboardingservice.leadonboardingservice.models.es.Lead.UserReportingData();
                userReportingData.setName(salesPersonDto.getName());
                userReportingData.setEmail(salesPersonDto.getEmail());
                String designation = getDesignation(salesPersonDto.getDesignationSlug());
                userReportingDataMap.put(designation,userReportingData);
                userReportingDataMap.put(ESConstants.ASSIGNEE_DETAILS,userReportingData);
                esLead.setHierarchyDetails(userReportingDataMap);
            }
        }catch (Exception e){
            e.printStackTrace();
            log.error("unable to add addHierarchyDetails in Es for lead {}", esLead.getId());
        }
    }

    private void buildPathForRegisteredLeads(ChannelPartnerDto channelPartnerDto, com.leadonboardingservice.leadonboardingservice.models.es.Lead esLead) {
        try {
            StringBuilder path = new StringBuilder();
            if (channelPartnerDto.getSalesAgents() != null && !channelPartnerDto.getSalesAgents().isEmpty()) {
                channelPartnerDto.getSalesAgents().forEach((key, salesAgentList) -> salesAgentList.forEach(salesAgent -> path.append(salesAgent.getIamUUID()).append(",")));
            };
            esLead.setPath(String.valueOf(path));
            addHierarchyDetails(channelPartnerDto,esLead);
        }catch (Exception e){
            log.error("error while updating channel partner path in ES for lead {}",channelPartnerDto.getIamUUID());
        }
    }

    private String getReferDealerId(String referrerUUID) {
        log.info("getting referrer dealer details for iamUUID {}", referrerUUID);
        ChannelPartnerDto channelPartnerDto = channelPartnerServiceApiHelper.getByChannelPartnerIamId(referrerUUID);
        return String.valueOf(channelPartnerDto.getDealerId());
    }
}
