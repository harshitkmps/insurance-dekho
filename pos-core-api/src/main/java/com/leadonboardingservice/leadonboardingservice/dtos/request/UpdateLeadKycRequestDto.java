package com.leadonboardingservice.leadonboardingservice.dtos.request;

import lombok.Builder;
import lombok.Data;

import javax.validation.constraints.Pattern;
import java.time.LocalDate;

@Data
@Builder
public class UpdateLeadKycRequestDto {
    private String leadId;
    private LocalDate dob;

    @Pattern(regexp = "[A-Z,a-z]{5}[0-9]{4}[A-Z,a-z]")
    private String pan;

    private String educationDetails;
}
