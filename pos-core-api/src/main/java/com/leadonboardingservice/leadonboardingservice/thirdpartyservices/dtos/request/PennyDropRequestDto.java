package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PennyDropRequestDto {

    private String fullname;
    private String beneficiaryaccountno;
    private String beneficiaryifsc;
    private String emailid;
    private String beneficiarymobileno;
    private String address;

}
