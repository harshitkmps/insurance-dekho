package com.leadonboardingservice.leadonboardingservice.thirdpartyservices;

import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.FacebookLeadResponseDto;
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
public class FacebookCampaignsServiceApiHelper {

    private final GenericRestClient restClient;
    @Value("${ide.facebook-webhook.host}")
    private String facebookWebhookHost;

    @Value("${ide.facebook-webhook.path}")
    private String facebookWebhookPath;

    @Value("${ide.facebook-webhook.access-token}")
    private String accessToken;



    @SneakyThrows
    public FacebookLeadResponseDto getLeadData(long leadgenId) {
        log.info("getting lead data for fbLead {}", leadgenId);
        String leadId = String.valueOf(leadgenId);

        Map<String, String> params = new HashMap<>();
        params.put("access_token", accessToken);

        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);

        RequestDetails requestDetails = new RequestDetails();
        requestDetails.setUrl(facebookWebhookHost+facebookWebhookPath+leadId);
        requestDetails.setMethod(HttpMethod.GET);
        requestDetails.setHeaders(headers);
        requestDetails.setParams(params);

        FacebookLeadResponseDto facebookLeadResponseDto = restClient.execute(requestDetails, null, FacebookLeadResponseDto.class);
        log.info("FB getLead Response "+facebookLeadResponseDto);
        return facebookLeadResponseDto;
    }

}
