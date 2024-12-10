package com.leadonboardingservice.leadonboardingservice.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CKYCDownloadRequest {
    private String ckycNumber;
    private String dateOfBirth;
    private String uuid;
}