package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignzyBankVerifyEssentialsDto {

    private String beneficiaryAccount;
    private String beneficiaryIFSC;
    private String beneficiaryMobile;
    private String beneficiaryName;
    private String nameFuzzy;
    private String nameMatchScore;
}
