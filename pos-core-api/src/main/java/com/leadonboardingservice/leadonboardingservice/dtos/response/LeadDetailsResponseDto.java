package com.leadonboardingservice.leadonboardingservice.dtos.response;

import com.leadonboardingservice.leadonboardingservice.dtos.LeadAdditionalDetailsDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadTrainingStatusDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LeadDetailsResponseDto {
    private LeadDetailsDto lead;

    private LeadProfileDto leadProfile;

    private List<LeadAddressDto> addresses;

    private List<BankDetailsDto> bankDetails;

    private List<FollowupDto> followupDetails;

    private List<DocumentDto> documents;

    private List<LeadTrainingStatusDto> trainings;

    private List<TimestampsDto> timestamps;

    private List<LeadAdditionalDetailsDto> additionalDetails;
}
