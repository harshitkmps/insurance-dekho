package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.dtos.response.OKYCDetailsResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.response.OKYCRedirectionResponse;
import com.leadonboardingservice.leadonboardingservice.services.OKYCService;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.SignzyServiceApiHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.Map;

@ConditionalOnProperty(name = "ide.stub.okyc", havingValue = "false", matchIfMissing = true)
@Service
@RequiredArgsConstructor
@Slf4j
public class OKYCServiceImpl implements OKYCService {

    private final SignzyServiceApiHelper signzyServiceApiHelper;

    @Override
    public OKYCRedirectionResponse createRedirectionURL(Map<String, String> request) {
        return signzyServiceApiHelper.getRedirectionResponse(request);
    }

    @Override
    public OKYCDetailsResponse getOKYCDetails(@NotNull String requestId){
        return signzyServiceApiHelper.getEadhaarDetails(requestId);
    }
}

