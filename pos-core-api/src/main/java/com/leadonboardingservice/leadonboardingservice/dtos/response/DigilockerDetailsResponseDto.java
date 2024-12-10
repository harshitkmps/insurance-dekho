package com.leadonboardingservice.leadonboardingservice.dtos.response;

import com.leadonboardingservice.leadonboardingservice.dtos.AddressDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadDocumentDto;
import com.leadonboardingservice.leadonboardingservice.models.digilocker.Poi;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class DigilockerDetailsResponseDto {
    AddressDto addressDetails;

    List<LeadDocumentDto> documentDetails;

    Poi personalDetails;

    String message;

}
