package com.leadonboardingservice.leadonboardingservice.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BankVerificationRequestDto {
    private String beneficiaryAccountNumber;
    private String beneficiaryIFSC;
    private String beneficiaryName;
    private String beneficiaryMobile;
    private String beneficiaryEmail;
    private String beneficiaryAddress;
    private String uuid;
}
