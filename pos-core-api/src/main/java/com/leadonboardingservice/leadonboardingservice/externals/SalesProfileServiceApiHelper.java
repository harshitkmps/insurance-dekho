package com.leadonboardingservice.leadonboardingservice.externals;

import com.leadonboardingservice.leadonboardingservice.externals.dtos.SalesPersonDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.SalesPersonResponseDto;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesProfileServiceApiHelper {
    private final GenericRestClient genericRestClient;

    @Value("${ide.sps.host}")
    private String host;
    @Value("${ide.sps.users-path}")
    private String usersPath;


    public SalesPersonDto getBySalesPersonIamId(@NotNull String iamUUID){
        log.info("getting sales person for iamUUId {}",iamUUID);
        Map<String,String> params = new HashMap<>();
        params.put("iam_uuid",iamUUID);
        params.put("getSalesMapping","true");
        return getBySalesPersonParams(params);
    }

    @SneakyThrows
    public SalesPersonDto getBySalesPersonParams(@NotNull Map<String,String> params){
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        String url = host+usersPath;
        RequestDetails requestDetails = RequestDetails.builder().url(url).headers(headers).params(params).method(HttpMethod.GET).build();
        SalesPersonResponseDto salesPersonResponseDto = genericRestClient.execute(requestDetails, null, SalesPersonResponseDto.class);
        log.info("sales person response {}",salesPersonResponseDto);
        return salesPersonResponseDto.getData().getSalesPersonDtoList().get(0);
    }
}
