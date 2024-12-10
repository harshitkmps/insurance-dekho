package com.leadonboardingservice.leadonboardingservice.helpers;

import lombok.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;

import java.util.HashMap;
import java.util.Map;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestDetails {

    private String url;

    private HttpMethod method;

    private Map<String, String> params = new HashMap<>();

    private HttpHeaders headers = new HttpHeaders();

}