package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignzyDetailsResponseDto {

    private JsonNode essentials;
    private String id;
    private String patronId;
    private String task;
    private SignzyDetailsDto result;
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SignzyDetailsDto {
        private String name;
        private String uid;
        private String dob;
        private String gender;
        private String address;
        private String photo;
        private String number;
        private String panStatus;
        private String panStatusCode;
        private JsonNode splitAddress;
        private JsonNode x509Data;
    }
}
