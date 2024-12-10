package com.leadonboardingservice.leadonboardingservice.thirdpartyservices;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.config.LogTime;
import com.leadonboardingservice.leadonboardingservice.config.MongoDBLog;
import com.leadonboardingservice.leadonboardingservice.dtos.request.ValidateAadhaarOtpRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.CKYCDownloadRequest;
import com.leadonboardingservice.leadonboardingservice.dtos.request.CKYCSearchRequest;
import com.leadonboardingservice.leadonboardingservice.dtos.request.OtpRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.AadhaarOtpResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.response.AadhaarDetailsResponse;
import com.leadonboardingservice.leadonboardingservice.exceptions.DownstreamAPIException;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.HttpClientErrorException;


@Service
@RequiredArgsConstructor
@Slf4j
public class TrackWizzServiceApiHelper {

    private final ObjectMapper objectMapper = new ObjectMapper();
    @Value("${ide.trackwizz.host}")
    private String host;
    @Value("${ide.trackwizz.search-path-v2}")
    private String searchCkycPathV2;
    @Value("${ide.trackwizz.download-path-v2}")
    private String downloadCkycPathV2;
    @Value("${ide.trackwizz.aadhaar-otp-path}")
    private String aadhaarOtpPath;
    @Value("${ide.trackwizz.aadhaar-details-path}")
    private String aadhaarDetailsPath;
    @Value("${ide.trackwizz.x-api-key}")
    private String xApiKey;

    private final GenericRestClient restClient;

    @MongoDBLog
    @LogTime
    @SneakyThrows
    public ObjectNode downLoadCKYCDetailsV2(CKYCDownloadRequest ckycDownloadRequest) {
        HttpHeaders headers = new HttpHeaders();
        String url = host+downloadCkycPathV2;
        headers.add("x-api-key", xApiKey);
        RequestDetails requestDetails = RequestDetails.builder()
                .url(url)
                .headers(headers)
                .method(HttpMethod.POST)
                .build();
        return restClient.execute(requestDetails,ckycDownloadRequest, ObjectNode.class);
    }

    @MongoDBLog
    @LogTime
    @SneakyThrows
    public ObjectNode searchCKYCDetailsV2(CKYCSearchRequest searchRequest) {
        HttpHeaders headers = new HttpHeaders();
        String url = host+searchCkycPathV2;
        headers.add("x-api-key", xApiKey);
        RequestDetails requestDetails = RequestDetails.builder()
                .url(url)
                .headers(headers)
                .method(HttpMethod.POST)
                .build();
        return restClient.execute(requestDetails,searchRequest, ObjectNode.class);
    }

    @MongoDBLog
    @LogTime
    public AadhaarOtpResponse sendAadhaarOtp(OtpRequestDto otpRequest) throws Exception {
        try {
            HttpHeaders headers = new HttpHeaders();
            String url = host + aadhaarOtpPath;
            headers.add("x-api-key", xApiKey);
            RequestDetails requestDetails = RequestDetails.builder()
                    .url(url)
                    .headers(headers)
                    .method(HttpMethod.POST)
                    .build();
            return restClient.execute(requestDetails,otpRequest, AadhaarOtpResponse.class);
        }catch (Exception e){
            e.printStackTrace();
            log.error("error occurred while fetching aadhaar otp Error: {} ",e.getMessage());
            HttpStatus statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            if(e instanceof HttpClientErrorException) {
                statusCode = ((HttpClientErrorException) e).getStatusCode();
            }
            throw new DownstreamAPIException(getErrorMessage(e.getMessage()),statusCode);
        }
    }

    @MongoDBLog
    @LogTime
    public AadhaarDetailsResponse validateAadhaarOtp(ValidateAadhaarOtpRequestDto submitOtpRequest)throws Exception{
        try {
            HttpHeaders headers = new HttpHeaders();
            String url = host + aadhaarDetailsPath;
            headers.add("x-api-key", xApiKey);
            RequestDetails requestDetails = RequestDetails.builder()
                    .url(url)
                    .headers(headers)
                    .method(HttpMethod.POST)
                    .build();
            return restClient.execute(requestDetails,submitOtpRequest, AadhaarDetailsResponse.class);
        }catch (Exception e){
            e.printStackTrace();
            log.error("error occurred while submitting aadhaar otp Error: {} ",e.getMessage());
            HttpStatus statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            if(e instanceof HttpClientErrorException) {
                statusCode = ((HttpClientErrorException) e).getStatusCode();
            }
            throw new DownstreamAPIException(getErrorMessage(e.getMessage()),statusCode);
        }
    }

    private String getErrorMessage(String errorMsg) {
        if(errorMsg==null || errorMsg.isEmpty()) return "Some Error Occurred";
        if(errorMsg.indexOf('{') == -1) return errorMsg;
        int startIndex = errorMsg.indexOf('{');
        errorMsg = errorMsg.substring(startIndex);
        JsonNode errorJson;
        try {
            errorJson = objectMapper.readTree(errorMsg);
            return errorJson.path("message").asText();
        } catch (JsonProcessingException jsonException) {
            log.error("Error occurred while parsing JSON");
            return errorMsg;
        }
    }
}
