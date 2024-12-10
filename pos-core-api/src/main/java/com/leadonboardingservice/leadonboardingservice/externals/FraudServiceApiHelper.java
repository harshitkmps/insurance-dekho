package com.leadonboardingservice.leadonboardingservice.externals;

import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.FraudSearchRequestDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.FraudSearchResponseDto;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class FraudServiceApiHelper {

    @Value("${ide.fraud.host}")
    private String fraudApiHost;
    @Value("${ide.fraud.search-path}")
    private String fraudApiSearchPath;

    private final GenericRestClient restClient;
    @SneakyThrows
    public FraudSearchResponseDto searchBlackList(FraudSearchRequestDto fraudSearchRequestDto) {
        log.info("inside searchBlackList for pan {} ",fraudSearchRequestDto);
        HttpHeaders headers = new HttpHeaders();
        String url = fraudApiHost+fraudApiSearchPath;
        RequestDetails requestDetails = RequestDetails.builder()
                .url(url)
                .headers(headers)
                .method(HttpMethod.POST)
                .build();
        return restClient.execute(requestDetails,fraudSearchRequestDto, FraudSearchResponseDto.class);
    }

}
