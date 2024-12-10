package com.leadonboardingservice.leadonboardingservice.externals;

import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.UserInfoDto;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import java.util.HashMap;
import java.util.Map;

import javax.validation.constraints.NotNull;


@RequiredArgsConstructor
@Service
@Slf4j
public class ApiPosApiHelper {

    private final GenericRestClient genericRestClient;

    @Value("${ide.apipos.host}")
    private String apiPosUrl;

    @Value("${ide.apipos.user-info-path}")
    private String userInfoPath;

    @Value("${ide.apipos.x-api-key}")
    private String authKey;

    public Boolean checkIfUserExistByUuid(@NotNull String uuid) {
        Map<String, String> params = new HashMap<>();
        params.put("uuid", uuid);
        return fetchUserInfo(params);
    }

    public Boolean checkIfUserExistByMobile(@NotNull String mobile) {
        Map<String, String> params = new HashMap<>();
        params.put("mobile", mobile);
        return fetchUserInfo(params);
    }
    
    public Boolean checkIfUserExistByEmail(@NotNull String email) {
        Map<String,String> params = new HashMap<>();
        params.put("email", email);
        return fetchUserInfo(params);
    }
    
    public Boolean fetchUserInfo(@NotNull Map<String,String> params) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.add("x-api-key", authKey);
            String url = apiPosUrl + userInfoPath;
            RequestDetails requestDetails = new RequestDetails();
            requestDetails.setUrl(url);
            requestDetails.setMethod(HttpMethod.GET);
            requestDetails.setHeaders(headers);
            requestDetails.setParams(params);
            UserInfoDto userInfo = genericRestClient.execute(requestDetails, null, UserInfoDto.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}
