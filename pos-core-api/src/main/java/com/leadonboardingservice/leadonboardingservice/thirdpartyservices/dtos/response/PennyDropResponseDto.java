package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PennyDropResponseDto {

    private Integer status;
    private String message;
    private Boolean isMethodSuccessfullyExecuted;
    private String msgFromBank;
    private String beneficiaryId;
    private PennyDropResponse response;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PennyDropResponse {
        private PennyDropTransferResponse startTransferResponse;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PennyDropTransferResponse {

        private String version;
        private String requestReferenceNo;
        private String uniqueResponseNo;
        private String attemptNo;
        private String reqTransferType;
        private String statusCode;
        private Boolean istxncompleted;
        private String txnstatuscode;
        private String txnsubstatuscode;
        private String benefNameAtBank;
        private String utrnumber;

    }
}
