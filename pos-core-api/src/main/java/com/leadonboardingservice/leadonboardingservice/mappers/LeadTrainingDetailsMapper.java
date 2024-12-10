package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadTrainingStatusDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.LeadProfileDto;
import com.leadonboardingservice.leadonboardingservice.models.LeadProfile;
import com.leadonboardingservice.leadonboardingservice.models.LeadTraining;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface LeadTrainingDetailsMapper {

    LeadTrainingDetailsMapper INSTANCE = Mappers.getMapper(LeadTrainingDetailsMapper.class);

    @Mapping(target = "product", source = "insuranceType")
    LeadTraining toEntity(LeadTrainingStatusDto leadRequestDto);

    @Mapping(target = "insuranceType", source = "product")
    LeadTrainingStatusDto toDto(LeadTraining lead);
}
