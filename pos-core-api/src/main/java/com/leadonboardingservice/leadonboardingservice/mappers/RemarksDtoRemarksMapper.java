package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.response.RemarksDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.TimestampsDto;
import com.leadonboardingservice.leadonboardingservice.models.LeadEvents;
import com.leadonboardingservice.leadonboardingservice.models.Remarks;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface RemarksDtoRemarksMapper {
    RemarksDtoRemarksMapper INSTANCE = Mappers.getMapper(RemarksDtoRemarksMapper.class);

    Remarks toEntity(RemarksDto remarksDto);

    RemarksDto toDto(Remarks remarks);
}
