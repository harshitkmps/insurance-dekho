package com.leadonboardingservice.leadonboardingservice.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateAccessTokenRequestDto {
    private String authorizationCode;
    private String uuid;
    private String source;
    private String codeVerifier;
}
