package com.leadonboardingservice.leadonboardingservice.externals;

import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.ChannelPartnerRequestDto;
import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.UpdateChannelPartnerRequestDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.ChannelPartnerResponseDataListDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.ChannelPartnerResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.ChannelPartnerResponseListDto;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChannelPartnerServiceApiHelper {

    private final GenericRestClient genericRestClient;
    @Value("${ide.cps.host}")
    private String cpsHostUrl;
    @Value("${ide.cps.path}")
    private String cpsPath;

    @SneakyThrows
    public ChannelPartnerDto createChannelPartner(ChannelPartnerRequestDto requestBody){
        log.info("creating channel partner request {} ",requestBody);
        String path = cpsPath;
        String url = cpsHostUrl +path;
        return createChannelPartners(url, requestBody);
    }

    @SneakyThrows
    public ChannelPartnerDto updateChannelPartner(ChannelPartnerRequestDto requestBody) throws Exception {
        if(requestBody.getChannelPartnerId() == null || requestBody.getChannelPartnerId().isEmpty()){
            throw new RuntimeException("cannot update channel partner. cpsId is null");
        }
        String path = cpsPath+"/"+requestBody.getChannelPartnerId();
        String url = cpsHostUrl +path;
        log.info("executing update channel partner request {}",requestBody);
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        RequestDetails requestDetails = RequestDetails.builder().url(url).headers(headers).method(HttpMethod.PUT).build();
        ChannelPartnerResponseDto channelPartnerResponseDto = genericRestClient.execute(requestDetails, requestBody, ChannelPartnerResponseDto.class);
        log.info("channel partner update response {}",channelPartnerResponseDto);
        return channelPartnerResponseDto.getData();
    }

    @SneakyThrows
    public ChannelPartnerDto updateChannelPartner(UpdateChannelPartnerRequestDto requestBody){
        if(requestBody.getChannelPartnerId() == null || requestBody.getChannelPartnerId().isEmpty()){
            throw new RuntimeException("cannot update channel partner. cpsId is null");
        }
        String path = cpsPath+"/"+requestBody.getChannelPartnerId();
        String url = cpsHostUrl +path;
        log.info("executing update channel partner request {}",requestBody);
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        RequestDetails requestDetails = RequestDetails.builder().url(url).headers(headers).method(HttpMethod.PUT).build();
        ChannelPartnerResponseDto channelPartnerResponseDto = genericRestClient.execute(requestDetails, requestBody, ChannelPartnerResponseDto.class);
        log.info("channel partner update response {}",channelPartnerResponseDto);
        return channelPartnerResponseDto.getData();
    }

    private ChannelPartnerDto createChannelPartners(String url, ChannelPartnerRequestDto requestBody) throws Exception {
        log.info("executing channel partner request {}",requestBody);
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        RequestDetails requestDetails = RequestDetails.builder().url(url).headers(headers).method(HttpMethod.POST).build();
        ChannelPartnerResponseDto channelPartnerResponseDto = genericRestClient.execute(requestDetails, requestBody, ChannelPartnerResponseDto.class);
        log.info("channel partner response {}",channelPartnerResponseDto);
        return channelPartnerResponseDto.getData();
    }

    @Cacheable(value = "los__channel__partners")
    @SneakyThrows
    public ChannelPartnerDto getByChannelPartnerIamId(@NotNull String iamUUID){
        log.info("getting channel partner for dealerId {}",iamUUID);
        Map<String,String> params = new HashMap<>();
        params.put("iam_uuid",iamUUID);
        params.put("status","1");
        params.put("getAgentMapping", "true");
        params.put("getFinancialInfo", "true");
        return getByDealerParams(params);

    }

    @SneakyThrows
    public ChannelPartnerDto getByDealerId(@NotNull String dealerId){
        log.info("getting channel partner for dealerId {}",dealerId);
        Map<String,String> params = new HashMap<>();
        params.put("dealerId",dealerId);
        params.put("getAgentMapping","true");
        return getByDealerParams(params);
    }

    @SneakyThrows
    public Optional<ChannelPartnerDto> getByPanNumber(@NotNull String panNumberEncrypted) {
        log.info("getting channel partner for panNumber {}", panNumberEncrypted);
        Map<String,String> params = new HashMap<>();
        params.put("pan_card", panNumberEncrypted);
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        String path = cpsPath;
        String url = cpsHostUrl +path;
        RequestDetails requestDetails = RequestDetails.builder().url(url).headers(headers).params(params).method(HttpMethod.GET).build();
        ChannelPartnerResponseDataListDto channelPartnerResponseDto = genericRestClient.execute(requestDetails, null, ChannelPartnerResponseDataListDto.class);
        log.info("channel partner response {}", channelPartnerResponseDto);
        if (!channelPartnerResponseDto.getData().getData().isEmpty()) {
            return Optional.of(channelPartnerResponseDto.getData().getData().get(0));
        }
        return Optional.empty();
    }

    @SneakyThrows
    public Optional<ChannelPartnerDto> getByAccountNumber(@NotNull String accountNumberEncrypted) {
        log.info("getting channel partner for accountNumber {}", accountNumberEncrypted);
        Map<String,String> params = new HashMap<>();
        params.put("account_number", accountNumberEncrypted);
        params.put("status","1");
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        String path = cpsPath;
        String url = cpsHostUrl +path;
        RequestDetails requestDetails = RequestDetails.builder().url(url).headers(headers).params(params).method(HttpMethod.GET).build();
        ChannelPartnerResponseListDto channelPartnerResponseDto = genericRestClient.execute(requestDetails, null, ChannelPartnerResponseListDto.class);
        log.info("channel partner response {}",channelPartnerResponseDto);
        if (!channelPartnerResponseDto.getData().isEmpty()) {
            return Optional.of(channelPartnerResponseDto.getData().get(0));
        }
        return Optional.empty();
    }

    @SneakyThrows
    public ChannelPartnerDto getByDealerParams(@NotNull Map<String,String> params){
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        String path = cpsPath;
        String url = cpsHostUrl +path;
        RequestDetails requestDetails = RequestDetails.builder().url(url).headers(headers).params(params).method(HttpMethod.GET).build();
        ChannelPartnerResponseListDto channelPartnerResponseDto = genericRestClient.execute(requestDetails, null, ChannelPartnerResponseListDto.class);
        log.info("channel partner response {}",channelPartnerResponseDto);
        return channelPartnerResponseDto.getData().get(0);
    }

}
