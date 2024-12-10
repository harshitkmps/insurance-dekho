package com.leadonboardingservice.leadonboardingservice.thirdpartyservices;

import com.leadonboardingservice.leadonboardingservice.config.LogTime;
import com.leadonboardingservice.leadonboardingservice.config.MongoDBLog;
import com.leadonboardingservice.leadonboardingservice.dtos.response.*;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.request.SignzyAuthRequestDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.request.SignzyBankVerifyRequestDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.SignzyAuthResponseDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.SignzyBankVerifyResponseDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.SignzyDetailsResponseDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.SignzyRedirectionResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SignzyServiceApiHelper {
    private final GenericRestClient restClient;

    @Value("${ide.signzy.username}")
    private String username;
    @Value("${ide.signzy.password}")
    private String password;
    @Value("${ide.signzy.host}")
    private String host;
    @Value("${ide.signzy.path}")
    private String path;


    @SneakyThrows
    private SignzyAuthResponseDto authorize(){
        SignzyAuthRequestDto requestDto = SignzyAuthRequestDto.builder()
                .username(username)
                .password(password)
                .build();
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        RequestDetails requestDetails = RequestDetails.builder()
                .url(host+path+"/login")
                .method(HttpMethod.POST)
                .headers(headers)
                .build();
        return restClient.execute(requestDetails,requestDto, SignzyAuthResponseDto.class);
    }

    @SneakyThrows
    public OKYCRedirectionResponse getRedirectionResponse(Map<String, String> request){
        SignzyAuthResponseDto authResponseDto = authorize();
        String url = host+ path +"/"+authResponseDto.getUserId()+"/digilockers";
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization",authResponseDto.getId());
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        Map<String,Object> requestMap = new HashMap<>();
        requestMap.put("task","url");
        Map<String,Object> essentials = new HashMap<>();
        essentials.put("signup",false);
        essentials.put("redirectUrl",request.get("redirectionUrl"));
        essentials.put("customerId",authResponseDto.getUserId());
        requestMap.put("essentials",essentials);
        RequestDetails requestDetails = RequestDetails.builder()
                .method(HttpMethod.POST)
                .url(url)
                .headers(headers).build();
        SignzyRedirectionResponseDto redirectionResponseDto =  restClient.execute(requestDetails,requestMap, SignzyRedirectionResponseDto.class);
        return OKYCRedirectionResponse.builder()
                .redirectionUrl(redirectionResponseDto.getResult().getUrl())
                .requestId(redirectionResponseDto.getResult().getRequestId())
                .build();
    }

    @SneakyThrows
    public OKYCDetailsResponse getEadhaarDetails(String requestId) {
        SignzyAuthResponseDto authResponseDto = authorize();
        String url = host + path + "/" +authResponseDto.getUserId()+"/digilockers";
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization",authResponseDto.getId());
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        Map<String,Object> requestMap = new HashMap<>();
        requestMap.put("task","getEadhaar");
        Map<String,Object> essentials = new HashMap<>();
        essentials.put("doctype","ADHAR");
        essentials.put("requestId",requestId);
        requestMap.put("essentials",essentials);
        RequestDetails requestDetails = RequestDetails.builder()
                .method(HttpMethod.POST)
                .url(url)
                .headers(headers).build();
        SignzyDetailsResponseDto signzyDetailsResponseDto =  restClient.execute(requestDetails,requestMap, SignzyDetailsResponseDto.class);
        return OKYCDetailsResponse.builder()
                .aadharId(signzyDetailsResponseDto.getResult().getUid())
                .address(signzyDetailsResponseDto.getResult().getAddress())
                .dateOfBirth(signzyDetailsResponseDto.getResult().getDob())
                .gender(signzyDetailsResponseDto.getResult().getGender())
                .name(signzyDetailsResponseDto.getResult().getName())
                .build();
    }

    @LogTime
    @SneakyThrows
    public SignzyBankVerifyResponseDto bankVerify(SignzyBankVerifyRequestDto requestDto) {
        log.debug("Calling Signzy API for bank verification");
        SignzyAuthResponseDto authResponseDto = authorize();
        String url = host + path + "/" + authResponseDto.getUserId() + "/bankaccountverifications";
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", authResponseDto.getId());
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        RequestDetails requestDetails = RequestDetails.builder()
                .method(HttpMethod.POST)
                .url(url)
                .headers(headers).build();
        SignzyBankVerifyResponseDto bankVerificationResponse = restClient.execute(requestDetails, requestDto, SignzyBankVerifyResponseDto.class);
        return bankVerificationResponse;
    }

    @MongoDBLog
    @LogTime
    @SneakyThrows
    public SignzyDetailsResponseDto verifyPan(PanValidationRequestDto panRequestData) {
        SignzyAuthResponseDto authResponseDto = authorize();
        String url = host + path + "/" +authResponseDto.getUserId()+"/panv2";
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization",authResponseDto.getId());
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        Map<String,Object> requestMap = new HashMap<>();
        requestMap.put("task","fetch");
        Map<String,Object> essentials = new HashMap<>();
        essentials.put("number", panRequestData.getPan());
        requestMap.put("essentials",essentials);
        RequestDetails requestDetails = RequestDetails.builder()
                .method(HttpMethod.POST)
                .url(url)
                .headers(headers).build();
        SignzyDetailsResponseDto signzyDetailsResponseDto =  restClient.execute(requestDetails,requestMap, SignzyDetailsResponseDto.class);
        return signzyDetailsResponseDto;
    }
}
