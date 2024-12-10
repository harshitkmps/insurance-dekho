package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.util.Date;

@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CKYCSearchResponse {
    public String requestId;
    public String cKYCStatus;
    public String cKYCAvailable;
    public String cKYCAccType;
    public String cKYCId;
    public int cKYCAge;
    public String cKYCFatherName;
    public Date cKYCGenDate;
    public String cKYCName;
}
