package com.leadonboardingservice.leadonboardingservice.externals;

import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.EncryptionRequest;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.DecryptionResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.EncryptionResponse;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;


@Component
@Slf4j
@RequiredArgsConstructor
public class EncryptionServiceApiHelper {
    private final GenericRestClient encryptionClient;
    @Value("${ide.encryption.host}")
    private String encryptionServiceHostUrl;

    public EncryptionResponse encrypt(EncryptionRequest requestBody) throws Exception {
        log.info("encrypting data {}",requestBody);
        String url = encryptionServiceHostUrl+"/cipher/v3/encrypt";
        RequestDetails requestDetails = RequestDetails.builder().url(url).method(HttpMethod.POST).build();
        EncryptionResponse response = encryptionClient.execute(requestDetails, requestBody, EncryptionResponse.class);
        log.info("response from encryption service {}",response);
        return response;
    }

    public DecryptionResponseDto decrypt(EncryptionRequest requestBody) throws Exception {
        log.info("decrypting data {}",requestBody);
        String url = encryptionServiceHostUrl+"/cipher/v2/decrypt";
        RequestDetails requestDetails = RequestDetails.builder().url(url).method(HttpMethod.POST).build();
        DecryptionResponseDto response = encryptionClient.execute(requestDetails, requestBody, DecryptionResponseDto.class);
        log.info("response from encryption service {}",response);
        return response;
    }

    public static void main(String[] args) throws Exception {
        List<String> data = new ArrayList<>();
        data.add("63497630edd44ea8845fa21d");
        data.add("63497630edd44ea8845fa234");
        EncryptionRequest request = EncryptionRequest.builder().data(data).build();
        EncryptionServiceApiHelper encryptionServiceApiHelper = new EncryptionServiceApiHelper(new GenericRestClient(new RestTemplate()));
        encryptionServiceApiHelper.decrypt(request);
    }
}
