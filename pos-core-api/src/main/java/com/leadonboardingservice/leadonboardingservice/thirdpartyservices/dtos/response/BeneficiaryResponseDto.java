package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class BeneficiaryResponseDto {

    private BeneficiaryResponse response;
    private Boolean isMethodSuccessfullyExecuted;

    @Data
    public static class BeneficiaryResponse {

        private String beneficiaryId;
        private String msg;
    }
}
