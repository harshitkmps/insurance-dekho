package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateVisitorRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.VisitorDetailsDto;
import com.leadonboardingservice.leadonboardingservice.enums.VisitorStatus;
import com.leadonboardingservice.leadonboardingservice.models.Visitor;
import liquibase.pro.packaged.L;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VisitorMapper {

    @Mappings({
            @Mapping(target = "mobileDecrypted", source = "mobile"),
            @Mapping(target = "emailDecrypted", source = "email"),
            @Mapping(target = "status", source = "status", defaultValue = "CREATED")
    })
    Visitor toEntity(CreateVisitorRequestDto visitorRequestDto);

    List<VisitorDetailsDto> toDto(List<Visitor> visitors);

    @Mappings({
            @Mapping(target = "mobile", source = "mobileEncrypted"),
            @Mapping(target = "email", source = "emailEncrypted"),
            @Mapping(target = "status", source = "status"),
            @Mapping(target = "id", source = "id"),
            @Mapping(target = "mobileMasked", source = "mobileMasked"),
            @Mapping(target = "emailMasked", source = "emailMasked")
    })
    VisitorDetailsDto toDto(Visitor visitor);

}
