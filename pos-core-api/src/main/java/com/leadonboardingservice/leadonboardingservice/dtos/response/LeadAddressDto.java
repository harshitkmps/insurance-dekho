package com.leadonboardingservice.leadonboardingservice.dtos.response;

import com.leadonboardingservice.leadonboardingservice.enums.AddressTypes;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeadAddressDto {
    private AddressTypes type;

    private String pincode;

    private String address;

    private String addressEncrypted;

    private String addressMasked;

    private String locality;

    private Integer cityId;

    private Integer stateId;

    private String gstNumber;
}
