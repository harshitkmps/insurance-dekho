package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OKYCDetailsResponse {

    private String name;
    private String dateOfBirth;
    private String gender;
    private String aadharId;
    private String address;

}
