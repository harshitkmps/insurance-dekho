package com.leadonboardingservice.leadonboardingservice.externals;

import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.BrokerageAreaResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.MasterTenantConfigResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.MasterTenantConfigResponseDto.TenantConfigDto;
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

import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrokerageMasterApiHelper {

    private final GenericRestClient genericRestClient;

    @Value("${ide.brokerage-master.host}")
    private String host;
    @Value("${ide.brokerage-master.pincode.path}")
    private String path;
    @Value("${ide.brokerage-master.fetch-tenant-path}")
    private String fetchTenantPath;

    @SneakyThrows
    public BrokerageAreaResponseDto.BrokerageAreaDto getAreaDetailsByPinCode(@NotNull String pinCode){
        log.info("getting area details for pin-code {}",pinCode);
        Map<String,String> params = new HashMap<>();
        params.put("pincode",pinCode);
        params.put("groupBy","area");
        params.put("subSource","partnerPortalWeb");
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        String url = host+path;
        RequestDetails requestDetails = RequestDetails.builder().url(url).headers(headers).params(params).method(HttpMethod.GET).build();
        BrokerageAreaResponseDto brokerageAreaResponseDto = genericRestClient.execute(requestDetails, null, BrokerageAreaResponseDto.class);
        log.info("brokerageAreaResponse  response {}",brokerageAreaResponseDto);
        return brokerageAreaResponseDto.getData().get(0);
    }

    @SneakyThrows
    public BrokerageAreaResponseDto.BrokerageAreaDto getAreaDetailsByCityId(@NotNull String cityId){
        log.info("getting area details for cityId {}",cityId);
        Map<String,String> params = new HashMap<>();
        params.put("cityId",cityId);
        params.put("groupBy","area");
        params.put("subSource","partnerPortalWeb");
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        String url = host+path;
        RequestDetails requestDetails = RequestDetails.builder().url(url).headers(headers).params(params).method(HttpMethod.GET).build();
        BrokerageAreaResponseDto brokerageAreaResponseDto = genericRestClient.execute(requestDetails, null, BrokerageAreaResponseDto.class);
        log.info("brokerageAreaResponse  city response {}",brokerageAreaResponseDto);
        return brokerageAreaResponseDto.getData().get(0);
    }

    @SneakyThrows
    public List<TenantConfigDto> getTenantConfig(Integer tenantId) {
        log.info("getting tenant info for tenant-id {}", tenantId);
        String path = fetchTenantPath + tenantId;
        String url = host + path;
        RequestDetails requestDetails = RequestDetails.builder()
                .url(url)
                .method(HttpMethod.GET)
                .build();
        MasterTenantConfigResponseDto response = genericRestClient.execute(requestDetails, null,
                MasterTenantConfigResponseDto.class);
        log.info("get tenant from brokerage master response {}", response);
        return response.getData().getTenant();
    }
}
