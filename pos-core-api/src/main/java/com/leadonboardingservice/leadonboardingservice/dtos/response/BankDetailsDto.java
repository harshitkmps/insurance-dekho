package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BankDetailsDto {
    private Boolean isActive;

    private Boolean isBankVerified;

    private String beneficiaryName;

    private String accountNumberMasked;

    private String accountNumberEncrypted;

    private String ifsc;

    private String bankName;

    private String bankBranchName;
    private Boolean isJointAccount;
}
