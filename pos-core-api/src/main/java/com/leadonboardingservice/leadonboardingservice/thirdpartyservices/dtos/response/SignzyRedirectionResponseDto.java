package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignzyRedirectionResponseDto {

    private String id;
    private String patronId;
    private String task;
    private SignzyResultDto result;
    private JsonNode essentials;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SignzyResultDto {
        private String url;
        private String requestId;
    }
}
