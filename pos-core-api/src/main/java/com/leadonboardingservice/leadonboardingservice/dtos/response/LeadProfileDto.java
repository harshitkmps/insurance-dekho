package com.leadonboardingservice.leadonboardingservice.dtos.response;

import com.leadonboardingservice.leadonboardingservice.annotations.ToUpperCase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeadProfileDto {
    @ToUpperCase
    private String pan;

    private String panEncrypted;

    private String educationDetails;

    private LocalDate dateOfBirth;

    private boolean PanVerified;
}
