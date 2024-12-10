package com.leadonboardingservice.leadonboardingservice.serviceimpls.stub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leadonboardingservice.leadonboardingservice.dtos.response.OKYCDetailsResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.response.OKYCRedirectionResponse;
import com.leadonboardingservice.leadonboardingservice.services.OKYCService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;
@ConditionalOnProperty(name = "ide.stub.okyc", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
@Service
public class OKYCStubServiceImpl implements OKYCService {
    private final ObjectMapper objectMapper = new ObjectMapper();
    @SneakyThrows
    @Override
    public OKYCRedirectionResponse createRedirectionURL(Map<String, String> request) {
        log.info("inside OKYCStubServiceImpl for creating redirection url");
        return objectMapper.readValue(getRedirectionURLData(),OKYCRedirectionResponse.class);
    }
    @SneakyThrows
    @Override
    public OKYCDetailsResponse getOKYCDetails(String requestId) {
        log.info("inside OKYCStubServiceImpl for getting okyc details");
        return objectMapper.readValue(getEEAdhaarDetails(),OKYCDetailsResponse.class);
    }

    private String getRedirectionURLData(){
        return "{\n" +
                "    \"requestId\": \"6352bddef768762ab8bb9575\",\n" +
                "    \"redirectionUrl\": \"https://api.digitallocker.gov.in/public/oauth2/1/authorize?client_id=7E5773C4&dl_flow&redirect_uri=https%3A%2F%2Fdigilocker-preproduction.signzy.tech%2Fdigilocker-auth-complete&response_type=code&state=6352bddef768762ab8bb9575\"\n" +
                "  }";
    }

    private String getEEAdhaarDetails(){
        return "{\n" +
                "    \"name\": \"ROHAN KUMAR\",\n" +
                "    \"dateOfBirth\": \"09/02/2000\",\n" +
                "    \"gender\": \"MALE\",\n" +
                "    \"aadharId\": \"xxxxxxxx3402\",\n" +
                "    \"address\": \"S/O: JEN TODWAL ENCLAVE DEEWAN COLONY , BAS BADANPURA OPP. PUSHP GARDEN BRAHMPURI JAIPUR RAJASTHAN 301001\"\n" +
                "  }";
    }
}
