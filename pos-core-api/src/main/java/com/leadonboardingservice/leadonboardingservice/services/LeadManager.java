package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.request.*;
import com.leadonboardingservice.leadonboardingservice.dtos.response.*;

public interface LeadManager {

    CreateLeadResponseDto createLead(CreateLeadRequestDto createLeadDto) throws Exception;
    LeadDetailsDto updateLeadBasicDetails(String leadId, UpdateLeadRequestDto updateLeadRequestDto) throws Exception;
    LeadDetailsResponseDto getLeadDetails(String leadId) throws Exception;
    LeadDetailsResponseDto updateLeadKyc(String leadId, LeadProfileDto leadProfileDto) throws Exception;
    LeadFollowupResponseDto updateLeadFollowupDetails(String leadId, LeadFollowupDto leadFollowupDto) throws Exception;
    LeadProfileDto updateLeadProfile(String leadId, LeadProfileDto leadProfileDto) throws Exception;
    LeadDocumentDto addLeadDocument(String leadUUID, LeadDocumentDto leadDocumentDto);
    LeadBankDetailsResponseDto updateLeadBankDetails(String leadUUID, LeadBankDto leadBankDto);
    LeadAddressDetailsResponseDto addLeadAddressDetails(String leadUUID, LeadAddressRequestDto leadAddressRequestDto) throws Exception;
    void createOrUpdateLeadTrainingStatus(String leadId, LeadTrainingStatusDto leadTrainingStatusDto) throws Exception;
    LeadAdditionalDetailsResponseDto addAdditionalDetails(String leadId, LeadAdditionalDetailsRequestDto requestDto);
    LeadAdditionalDetailsResponseDto getAdditionalDetails(String leadId, LeadAdditionalDetailsRequestDto requestDto);
    void updateTrainingStatus();

    void checkLeadEligibleForQC(String leadId) throws Exception;
    LeadDetailsResponseDto fetchLeadAadhaarDetails(String leadId, ValidateAadhaarOtpRequestDto submitOtpRequestDto) throws Exception;
}
