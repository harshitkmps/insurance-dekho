package com.leadonboardingservice.leadonboardingservice.mappers;

import com.leadonboardingservice.leadonboardingservice.dtos.AddressDto;
import com.leadonboardingservice.leadonboardingservice.models.Address;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LeadAddressMapper {

    LeadAddressMapper INSTANCE = Mappers.getMapper(LeadAddressMapper.class);


    List<Address> toEntity(List<AddressDto> leadAddressDtoList);
    List<AddressDto> toDto(List<Address> addressList);

    @Mapping(source = "fullAddress", target = "address")
    Address toEntity(AddressDto addressDto);
    @Mapping(source = "address", target = "fullAddress")
    AddressDto toDto(Address address);
}
