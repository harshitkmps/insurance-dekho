package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadTrainingStatusDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.TimestampsDto;
import com.leadonboardingservice.leadonboardingservice.models.LeadEvents;
import com.leadonboardingservice.leadonboardingservice.models.LeadTraining;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.security.Timestamp;

@Mapper(componentModel = "spring")
public interface TimestampDtoLeadEventMapper {

    TimestampDtoLeadEventMapper INSTANCE = Mappers.getMapper(TimestampDtoLeadEventMapper.class);

    LeadEvents toEntity(TimestampsDto timestampsDto);

    TimestampsDto toDto(LeadEvents leadEvent);
}
