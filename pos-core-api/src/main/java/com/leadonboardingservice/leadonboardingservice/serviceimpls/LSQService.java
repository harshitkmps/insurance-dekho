package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.fasterxml.jackson.databind.JsonNode;
import com.leadonboardingservice.leadonboardingservice.dtos.LSQLeadDto;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

@Service
@Slf4j
@RequiredArgsConstructor
public class LSQService {
    @Value("${ide.lsq.host}")
    private String lsqHost;
    @Value("${ide.lsq.upsert-path}")
    private String lsqUpsertPath;
    @Value("${ide.lsq.access-key}")
    private String lsqAccessKey;
    @Value("${ide.lsq.secret-key}")
    private String lsqSecretKey;
    @Value("${ide.lsq.x-api-key}")
    private String lsqXApiKey;
    private final GenericRestClient restClient;
    private final LSQMapperServiceImpl lsqMapperService;

    @SneakyThrows
    public void upsertLead(LSQLeadDto lsqLeadDto) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
            headers.add("x-api-key", lsqXApiKey);
            String url = lsqHost + lsqUpsertPath + "?accessKey=" + lsqAccessKey + "&secretKey=" + lsqSecretKey;
            RequestDetails requestDetails = RequestDetails.builder().url(url).headers(headers).method(HttpMethod.POST).build();
            JsonNode jsonNode = restClient.execute(requestDetails, lsqLeadDto, JsonNode.class);
            log.info("response received from lsq upsert for {} ", jsonNode);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("error upserting in lsq" + e.getResponseBodyAsString());
        }
    }

    public void upsertLead(Long leadId) {
        LSQLeadDto lsqLeadDto = lsqMapperService.mapLead(leadId);
        if (lsqLeadDto == null) {
            return;
        }
        upsertLead(lsqLeadDto);
    }
}
