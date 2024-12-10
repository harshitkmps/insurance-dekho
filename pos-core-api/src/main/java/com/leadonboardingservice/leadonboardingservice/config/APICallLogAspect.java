package com.leadonboardingservice.leadonboardingservice.config;

import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import com.leadonboardingservice.leadonboardingservice.models.mongo.ApiCall;
import com.leadonboardingservice.leadonboardingservice.repositories.mongoposrepository.ApiCallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
@Aspect
public class APICallLogAspect {

    private final List<String> registeredUrlsToLog = List.of("/v2/channel-partners");
    private final List<HttpMethod> trackedMethods = List.of(HttpMethod.POST, HttpMethod.PUT);

    @Autowired
    private final ApiCallRepository apiCallRepository;

    @Pointcut("execution(* com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient.execute(..))")
    public void externalApiCallService(){}


    @Around("externalApiCallService()")
    public Object logCalls(ProceedingJoinPoint pjp) throws Throwable{
        Object result=null;
        try {
            RequestDetails requestDetails = (RequestDetails) pjp.getArgs()[0];
            boolean isTrackedMethod = trackedMethods.contains(requestDetails.getMethod());
            boolean isUrlRegistered = registeredUrlsToLog.stream().anyMatch(x -> requestDetails.getUrl().contains(x));
            if(!isUrlRegistered || !isTrackedMethod) {
                result = pjp.proceed();
                return result;
            }
            Map<String,Object> requestLog = new HashMap<>();
            requestLog.put("request_details",pjp.getArgs()[0]);
            if(pjp.getArgs()[1] != null){
                requestLog.put("request_body",pjp.getArgs()[1]);
            }
            ApiCall.ApiRequest apiRequest = ApiCall.ApiRequest.builder().apiRequest(requestLog).build();
            Object response = null;
            // Build the apiCall from request
            ApiCall apiCall = ApiCall.builder()
                    .status("SUBMITTED")
                    .request(apiRequest)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            //save the same to db
            apiCall = apiCallRepository.save(apiCall);

            // Proceed to call the external Api and get the result
            try {
                result = pjp.proceed();
                updateApiCall(apiCall.getId(), "COMPLETED", result);
            } catch (Throwable e) {
                if (e instanceof HttpStatusCodeException) {
                    String errorResponse = ((HttpStatusCodeException) e).getResponseBodyAsString();
                    updateApiCall(apiCall.getId(), "FAILED", errorResponse);
                }
                throw e;
            }
            //continue with response
        }catch (Exception e){
            e.printStackTrace();
            throw e;
        }
        return result;
    }

    private void updateApiCall(String apiCallId, String status, Object response) {
        Optional<ApiCall> optionalApiCall = apiCallRepository.findById(apiCallId);
        if (optionalApiCall.isPresent()) {
            optionalApiCall.get().setStatus(status);
            optionalApiCall.get().setUpdatedAt(LocalDateTime.now());
            if (response != null) {
                optionalApiCall.get().setResponse(response);
            }
            apiCallRepository.save(optionalApiCall.get());
        }
    }

}
