package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.UpdateLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.LeadDetailsDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.LeadDetailsResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.IAMResponseDto;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring",uses = {LeadTrainingDetailsMapper.class,
        LeadProfileMapper.class, LeadDocumentMapper.class, LeadFollowUpMapper.class, RemarksDtoRemarksMapper.class, TimestampDtoLeadEventMapper.class,
        LeadAdditionalDetailsMapper.class,LeadAddressMapper.class, LeadBankMapper.class
})
public interface LeadBasicDetailsMapper {

    LeadBasicDetailsMapper INSTANCE = Mappers.getMapper(LeadBasicDetailsMapper.class);

    //@Mapping(target = "mobileDecrypted", source = "mobile")
    @Mapping(target = "emailDecrypted", source = "email")
    @Mapping(target = "cityId", source =  "cityId")
    Lead toEntity(UpdateLeadRequestDto leadRequestDto);

    //@Mapping(target = "dataMember", ignore = true)
    @Mappings({
            @Mapping(target = "assignedSalesUserId", source = "assignedSalesIamUuid"),
            @Mapping(target = "referrerUserId", source = "referrerIamUuid")
    })
    LeadDetailsDto toDto(Lead lead);
    @Mappings({
            @Mapping(target = "mobileDecrypted", source = "mobile"),
            @Mapping(target = "emailDecrypted", source = "email"),
            @Mapping(target = "status",constant = "CREATED"),
            @Mapping(target = "leadOriginatedBy", source = "leadOriginMethods"),
            @Mapping(target = "tenantId", source = "tenantId"),
            @Mapping(target = "referrerIamUuid", source = "referrerUserId"),
            @Mapping(target = "assignedSalesIamUuid", source = "salesUserAssignId")
    })
    Lead toEntity(CreateLeadRequestDto createLeadRequestDto);

    @Mappings({
            @Mapping(target = "timestamps",source = "leadEvents"),
            @Mapping(target = "addresses",source = "address"),
            @Mapping(target = "followupDetails", source = "leadFollowups"),
            @Mapping(target = "trainings",source = "leadTrainings"),
            @Mapping(target = "lead",source = "lead"),
            @Mapping(target = "additionalDetails", source = "leadAdditionalDetails")
    })
    LeadDetailsResponseDto toLeadDetailsDto(Lead lead);

    @Mappings({
            @Mapping(target = "mobileDecrypted", source = "mobile"),
            @Mapping(target = "emailDecrypted", source = "email", qualifiedByName = "mapNonEmptyEmail"),
            @Mapping(target = "status", ignore = true)
    })
    Lead toEntity(IAMResponseDto.IAMResponse iamResponse);

    @Named("mapNonEmptyEmail")
    default String mapNonEmptyEmail(String email) {
        return (email != null && !email.trim().isEmpty()) ? email : null;
    }
}
