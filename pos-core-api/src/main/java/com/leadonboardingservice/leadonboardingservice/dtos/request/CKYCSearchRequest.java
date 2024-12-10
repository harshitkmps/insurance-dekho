package com.leadonboardingservice.leadonboardingservice.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CKYCSearchRequest {

    private InputType inputType;
    private String inputId;
    private String uuid;
    private String firstName;
    private String lastName;
    private String middleName;
    private String dob;
    private String gender;

    public enum InputType {
        PAN, VOTER_ID, PASSPORT, AADHAAR, DRIVING_LICENSE, CKYCID
    }


}
