package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadBankDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.LeadBankDetailsResponseDto;
import com.leadonboardingservice.leadonboardingservice.models.BankDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface LeadBankMapper {

    LeadBankMapper INSTANCE = Mappers.getMapper(LeadBankMapper.class);

    @Mappings({
            @Mapping(target = "accountNumberDecrypted", source = "accountNumber"),
            @Mapping(target = "ifsc", source = "ifsc"),
            @Mapping(target = "isBankVerified", constant = "false"),
            @Mapping(target = "isActive", constant = "true")
    })
    BankDetail toEntity(LeadBankDto leadBankDto);

    LeadBankDetailsResponseDto toDto(BankDetail bankDetail);
}
