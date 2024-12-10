package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.leadonboardingservice.leadonboardingservice.dtos.AddressDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadAddressRequestDto {
    private List<AddressDto> addresses;
    @Schema(defaultValue = "false")
    private Boolean requestForQC= Boolean.FALSE;
}


