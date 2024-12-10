package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.response.OKYCDetailsResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.response.OKYCRedirectionResponse;

import javax.validation.constraints.NotNull;
import java.util.Map;

public interface OKYCService {
    OKYCRedirectionResponse createRedirectionURL(Map<String, String> request);

    OKYCDetailsResponse getOKYCDetails(@NotNull String requestId);
}
