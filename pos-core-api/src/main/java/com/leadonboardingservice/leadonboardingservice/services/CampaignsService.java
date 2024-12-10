package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.request.FacebookPostRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.CreateLeadResponseDto;

import java.util.List;

public interface CampaignsService {
    List<CreateLeadResponseDto> onboardFacebookLead(FacebookPostRequestDto requestDto) throws Exception;

}
