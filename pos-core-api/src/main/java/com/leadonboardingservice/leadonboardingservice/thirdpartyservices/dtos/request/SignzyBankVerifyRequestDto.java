package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.request;

import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.SignzyBankVerifyEssentialsDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignzyBankVerifyRequestDto {

    private String task;
    private String leadUUID;
    private SignzyBankVerifyEssentialsDto essentials;
}
