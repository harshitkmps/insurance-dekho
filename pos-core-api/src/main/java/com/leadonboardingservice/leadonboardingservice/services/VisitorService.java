package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateVisitorRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.VisitorDetailsDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.VisitorListPageDto;
import org.springframework.data.domain.Pageable;

public interface VisitorService {
    VisitorDetailsDto createVisitor(CreateVisitorRequestDto visitor) throws Exception;

    VisitorListPageDto getMyVisitors(String userId, String name, Pageable pageable) throws Exception;

    VisitorDetailsDto updateVisitor(String id, CreateVisitorRequestDto visitorRequestDto) throws Exception;

    VisitorDetailsDto getVisitor(String id) throws Exception;

}
