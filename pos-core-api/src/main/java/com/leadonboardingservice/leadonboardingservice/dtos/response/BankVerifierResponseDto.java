package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BankVerifierResponseDto {
    private boolean isBankVerified;
    private String beneNameAtBank;
    private String message;
    private String messageFromBank;
    private String nameMatch;
}