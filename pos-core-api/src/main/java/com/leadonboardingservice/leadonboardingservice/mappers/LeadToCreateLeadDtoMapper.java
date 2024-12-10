package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import org.mapstruct.Mapper;
import org.springframework.context.annotation.Bean;

@Mapper
public interface LeadToCreateLeadDtoMapper {
//    CreateLeadRequestDto leadToCreateLeadRequestDto(Lead lead);
    Lead createLeadRequestDtoToLead(CreateLeadRequestDto createLeadRequestDto);
}
