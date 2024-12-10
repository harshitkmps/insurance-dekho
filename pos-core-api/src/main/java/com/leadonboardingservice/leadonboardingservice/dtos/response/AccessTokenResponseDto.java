package com.leadonboardingservice.leadonboardingservice.dtos.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class AccessTokenResponseDto {

    @JsonProperty("access_token")
    private String accessToken;

    private String digilockerid;

    private String name;

    private String dob;

    private String gender;

    private String eaadhaar;

    private String mobile;
}
