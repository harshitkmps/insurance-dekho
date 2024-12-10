package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.leadonboardingservice.leadonboardingservice.dtos.LeadAdditionalDetailsDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeadAdditionalDetailsRequestDto {
    List<LeadAdditionalDetailsDto> data;
}
