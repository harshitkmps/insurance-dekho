package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.response.LeadProfileDto;
import com.leadonboardingservice.leadonboardingservice.models.LeadProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface LeadProfileMapper {

    LeadProfileMapper INSTANCE = Mappers.getMapper(LeadProfileMapper.class);
    @Mappings({
            @Mapping(target = "panDecrypted", source = "pan"),
            @Mapping(target = "isPanVerified", source = "panVerified", defaultValue = "false")
    })
    LeadProfile toEntity(LeadProfileDto leadRequestDto);

    @Mapping(target = "pan", source = "panMasked")
    LeadProfileDto toDto(LeadProfile lead);
}
