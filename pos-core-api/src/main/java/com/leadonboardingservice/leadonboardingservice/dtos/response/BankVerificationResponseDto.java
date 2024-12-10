package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BankVerificationResponseDto {
    private boolean isBankVerified;
    private String beneficiaryAccount;
    private String beneficiaryIFSC;
    private String beneNameAtBank;
    private String isAccountActive;
    private String messageFromBank;
    private String message;
    private String nameMatch;
}
