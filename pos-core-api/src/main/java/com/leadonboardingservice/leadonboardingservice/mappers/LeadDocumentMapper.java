package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadDocumentDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.DocumentDto;
import com.leadonboardingservice.leadonboardingservice.models.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface LeadDocumentMapper {

    LeadDocumentMapper INSTANCE = Mappers.getMapper(LeadDocumentMapper.class);

    @Mappings({
            @Mapping(source = "source", target = "documentSource"),
            @Mapping(source = "type", target = "documentType"),
            @Mapping(source = "rejectStatusRemarkId", target = "remarkId")
    })
    LeadDocumentDto toDto(Document leadDocument);

    @Mappings({
            @Mapping(target = "url",source = "tempDocUrl"),
            @Mapping(source = "rejectStatusRemarkId", target = "remarkId")
    })
    DocumentDto toDtoCopy(Document leadDocument);
    @Mappings({
            @Mapping(target = "source", source = "documentSource", defaultValue = "MANUAL"),
            @Mapping(target = "type", source = "documentType"),
            @Mapping(target = "status", source = "status" , defaultValue = "UPLOADED"),
            @Mapping(target = "rejectStatusRemarkId", source = "remarkId")
    })
    Document toEntity(LeadDocumentDto leadDocumentDto);
}
