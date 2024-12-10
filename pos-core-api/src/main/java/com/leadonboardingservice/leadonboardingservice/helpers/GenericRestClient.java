package com.leadonboardingservice.leadonboardingservice.helpers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class GenericRestClient {

    private final RestTemplate restTemplate;

    public <V,T> V execute(RequestDetails requestDetails, T body, Class<V> genericClass) throws Exception{
        log.info("executing request [requestDetails] {}. Request body {}", requestDetails, body);
        if(requestDetails.getParams() != null){
            String result = requestDetails.getParams().entrySet().stream()
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(Collectors.joining("&"));
            requestDetails.setUrl(requestDetails.getUrl()+"?"+result);
        }
        HttpEntity<T> entity = new HttpEntity<T>(body, requestDetails.getHeaders());
        ResponseEntity<V> response = restTemplate.exchange(requestDetails.getUrl(), requestDetails.getMethod(),
                entity, genericClass);
        return response.getBody();
        // handle response and exception here
    }

}