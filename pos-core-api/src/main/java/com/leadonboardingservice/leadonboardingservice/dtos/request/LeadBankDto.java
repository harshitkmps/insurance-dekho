package com.leadonboardingservice.leadonboardingservice.dtos.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeadBankDto {
    @NotNull
    private String ifsc;

    @NotNull
    private String accountNumber;

//    @NotNull
    private String beneficiaryName;

    @NotNull
    private String bankName;

    private boolean doPennyTesting;

    private Boolean isJointAccount;

    @Schema(defaultValue = "false")
    private Boolean requestForQC= Boolean.FALSE;
}
