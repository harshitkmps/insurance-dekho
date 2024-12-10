package com.leadonboardingservice.leadonboardingservice.externals;

import com.leadonboardingservice.leadonboardingservice.constants.IAMConstants;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.IAMRequestDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.IAMResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.IAMUpdateRequestDto;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class IAMServiceApiHelper {

    private final GenericRestClient restClient;
    @Value("${ide.iam.host}")
    private String iamHost;
    @Value("${ide.iam.fetch-user-path}")
    private String fetchUserPath;
    @Value("${ide.iam.create-user-path}")
    private String createUserPath;
    @Value("${ide.iam.x-host-name}")
    private String iamXHostName;
    @Value("${ide.iam.x-api-key}")
    private String xApiKey;

    public String fetchIAMId(String name, String email, @NonNull String mobile, Long tenantId, String referAuthId){
        log.info("fetching iam id for name {}, mobile {} , email {}, tenantId {}, ",name,mobile,email, tenantId);
        IAMResponseDto responseDto = fetchUserByMobileOrEmail(mobile, null);
        if (responseDto.getStatus().equalsIgnoreCase(IAMConstants.TRUE)){
            return responseDto.getData().getUuid();
        }
        IAMRequestDto iamRequestDto = IAMRequestDto.builder()
                .source("AGENCY")
                .subSource("POS")
                .authMode("OTP")
                .mobile(mobile)
                .name(name)
                .email(email)
                .status(1)
                .tenantId(tenantId)
                .referenceAuthId(referAuthId)
                .build();
        IAMResponseDto iamCreateResponseDto = createUser(iamRequestDto);
        if(iamCreateResponseDto.getStatus().equalsIgnoreCase(IAMConstants.TRUE)){
            return iamCreateResponseDto.getData().getUuid();
        }
        throw new RuntimeException("Error in creation from IAM: " + iamCreateResponseDto.getMessage());
    }

    public IAMResponseDto.IAMResponse validateIamId(String iamUUID, Long tenantId) {
        log.info("validating iam uuid {} ", iamUUID);
        IAMResponseDto iamResponseDto = fetchUserByIamUUID(iamUUID);
        if (IAMConstants.FALSE.equalsIgnoreCase(iamResponseDto.getStatus())) {
            throw new RuntimeException("IAM details not found for UUID: " + iamUUID);
        }
        IAMResponseDto.IAMResponse iamResponse = iamResponseDto.getData();
        Long reqTenantId = (tenantId != null) ? tenantId : 1L;
        if(!reqTenantId.equals(iamResponse.getTenantId())) {
            throw new RuntimeException("Iam account exist with different Tenant");
        }
        return iamResponse;
    }

    @SneakyThrows
    public IAMResponseDto createUser(IAMRequestDto iamRequestDto){
        log.info("creating user in in iam id {} ",iamRequestDto);
        String path = createUserPath;
        String url = iamHost+path;
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-HOSTNAME",iamXHostName);
        headers.add("x-api-key",xApiKey);
        RequestDetails requestDetails = RequestDetails.builder()
                .url(url)
                .headers(headers)
                .method(HttpMethod.POST)
                .build();
        IAMResponseDto response = restClient.execute(requestDetails, iamRequestDto, IAMResponseDto.class);
        log.info("create user in iam response {}",response);
        return response;
    }

    @SneakyThrows
    public IAMResponseDto fetchUserByMobileOrEmail(String mobile, String email){
        log.info("getting user from iam for mobile {}, email {} ",mobile, email);
        String url;
        Map<String,String> params = new HashMap<>();
        if(StringUtils.isEmpty(mobile)) {
            url = iamHost + fetchUserPath;
        }else {
            url =iamHost + fetchUserPath + mobile;
        }
        if(!StringUtils.isEmpty(email)) {
            params.put("email",email);
        }
        return fetchUser(url, params);
    }

    @SneakyThrows
    public IAMResponseDto updateUser(IAMUpdateRequestDto iamRequestDto, String iamUUID){
        log.info("updating user in in iam request {}, iam uuid {} ",iamRequestDto, iamUUID);
        String path = createUserPath + "/" + iamUUID;
        String url = iamHost+path;
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-HOSTNAME",iamXHostName);
        headers.add("x-api-key",xApiKey);
        RequestDetails requestDetails = RequestDetails.builder()
                .url(url)
                .headers(headers)
                .method(HttpMethod.POST)
                .build();
        IAMResponseDto response = restClient.execute(requestDetails, iamRequestDto, IAMResponseDto.class);
        log.info("update user in iam response {}",response);
        return response;
    }

    @SneakyThrows
    public IAMResponseDto fetchUserByIamUUID(String iamUUID){
        log.info("getting user from iam {} ",iamUUID);
        String path = createUserPath + "/" + iamUUID;
        String url = iamHost + path;
        return fetchUser(url,null);
    }

    @SneakyThrows
    public IAMResponseDto fetchUser(@NonNull String url, Map<String,String> params){
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-HOSTNAME",iamXHostName);
        headers.add("x-api-key",xApiKey);
        RequestDetails requestDetails = RequestDetails.builder()
                .url(url)
                .headers(headers)
                .params(params)
                .method(HttpMethod.GET)
                .build();
        IAMResponseDto iamResponseDto = restClient.execute(requestDetails, null, IAMResponseDto.class);
        log.info("get user from iam response {}",iamResponseDto);
        return iamResponseDto;
    }
}
