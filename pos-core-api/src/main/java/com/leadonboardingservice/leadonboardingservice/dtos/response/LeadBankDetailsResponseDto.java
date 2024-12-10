package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeadBankDetailsResponseDto {

    private String ifsc;
    private String accountNumber;
    private String accountNumberMasked;
    private String accountNumberEncrypted;
    private String beneficiaryName;
    private String bankName;
    private Boolean isBankVerified;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    private boolean isMovedToQC;
    private String messageFromBank;
    private Boolean isJointAccount;

}
