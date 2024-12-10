package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AadhaarResponseData {
    private String clientId;
    private String status;
    private String name;
    private String dob;
    private String gender;
    private String profileDocumentId;
    private String careOf;
    private String country;
    private String state;
    private String district;
    private String house;
    private String locality;
    private String landmark;
    private String postOffice;
    private String vtc;
    private String subDistrict;
    private String street;
    private String pincode;
}
