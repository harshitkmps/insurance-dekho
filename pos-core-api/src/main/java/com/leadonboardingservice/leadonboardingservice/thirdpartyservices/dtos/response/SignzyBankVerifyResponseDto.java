package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response;

import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.SignzyBankVerifyResultDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignzyBankVerifyResponseDto {

    private String id;
    private String patronId;
    private String task;
    private SignzyBankVerifyResultDto result;
}
