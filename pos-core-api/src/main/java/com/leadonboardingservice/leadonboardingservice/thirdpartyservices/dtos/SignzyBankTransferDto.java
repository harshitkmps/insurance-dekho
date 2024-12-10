package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignzyBankTransferDto {
    private String response;
    private String bankRRN;
    private String beneName;
    private String beneMMID;
    private String beneIFSC;
}
