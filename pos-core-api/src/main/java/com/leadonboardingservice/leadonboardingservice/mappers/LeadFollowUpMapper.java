package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadFollowupDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.LeadFollowupResponseDto;
import com.leadonboardingservice.leadonboardingservice.models.LeadFollowup;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface LeadFollowUpMapper {

    LeadFollowUpMapper INSTANCE = Mappers.getMapper(LeadFollowUpMapper.class);
    @Mappings({
            @Mapping(target = "isActive", constant = "true"),
            @Mapping(source = "status", target = "status", defaultValue = "CREATED")
    })
    LeadFollowup toEntity(LeadFollowupDto leadFollowupDto);
    LeadFollowupResponseDto toDto(LeadFollowup leadFollowup);
}
