package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.response.LeadListResponseDto;
import java.util.Map;

public interface LeadSearchService {
    LeadListResponseDto searchLeads(Map<String,Object> searchParams);
    LeadListResponseDto searchLeadsWithAggregation(Map<String,Object> searchParams);
}
