package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignzyBankVerifyResultDto {

    private String active;
    private String reason;
    private String nameMatch;
    private String mobileMatch;
    private String signzyReferenceId;
    private String nameMatchScore;
    private SignzyBankTransferDto bankTransfer;
    private SignzyBankVerifyAuditTrailDto auditTrail;

}
