package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.LeadAdditionalDetailsDto;
import com.leadonboardingservice.leadonboardingservice.models.LeadAdditionalDetails;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LeadAdditionalDetailsMapper {
    LeadAdditionalDetailsMapper INSTANCE = Mappers.getMapper(LeadAdditionalDetailsMapper.class);

    @Mappings({
            @Mapping(target = "propertyName", source = "name"),
            @Mapping(target = "propertyValue", source = "value"),
    })
    LeadAdditionalDetails toEntity(LeadAdditionalDetailsDto leadAdditionalDetailsDtos);

    @Mappings({
            @Mapping(target = "name", source = "propertyName"),
            @Mapping(target = "value", source = "propertyValue"),
    })
    LeadAdditionalDetailsDto toDto(LeadAdditionalDetails  leadAdditionalDetails);


    List<LeadAdditionalDetails> toEntity(List<LeadAdditionalDetailsDto> data);

    List<LeadAdditionalDetailsDto> toDto(List<LeadAdditionalDetails> updatedDetailsList);
}
