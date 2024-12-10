package com.leadonboardingservice.leadonboardingservice.serviceimpls.stub;

import com.leadonboardingservice.leadonboardingservice.dtos.response.PanValidationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.PanVerificationResponse;
import com.leadonboardingservice.leadonboardingservice.services.PanVerifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StubPanVerifier implements PanVerifier {

    @Override
    public PanVerificationResponse verifyPan(PanValidationRequestDto panValidationRequest) {
        return PanVerificationResponse.builder()
                .name("Stub Name")
                .isPanValid(true)
                .panStatusCode("E")
                .panStatus("VALID")
                .build();
    }

    @Override
    public String getName() {
        return "SIGNZYSTUB";
    }
}
