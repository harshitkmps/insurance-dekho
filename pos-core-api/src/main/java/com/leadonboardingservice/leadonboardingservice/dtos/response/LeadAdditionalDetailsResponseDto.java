package com.leadonboardingservice.leadonboardingservice.dtos.response;

import com.leadonboardingservice.leadonboardingservice.dtos.LeadAdditionalDetailsDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeadAdditionalDetailsResponseDto {
    List<LeadAdditionalDetailsDto> data;
}
