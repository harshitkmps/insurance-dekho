package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OKYCRedirectionResponse {
    private String requestId;
    private String redirectionUrl;
}