package com.leadonboardingservice.leadonboardingservice.serviceimpls.bankverificationhandlers;

import com.leadonboardingservice.leadonboardingservice.dtos.response.PanValidationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.PanVerificationResponse;
import com.leadonboardingservice.leadonboardingservice.services.PanVerifier;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.SignzyServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.SignzyDetailsResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class SingzyPanVerifier implements PanVerifier {
    private final SignzyServiceApiHelper signzyServiceApiHelper;

    @Override
    public PanVerificationResponse verifyPan(PanValidationRequestDto panValidationRequest) {
        try {
            SignzyDetailsResponseDto signzyResponse = signzyServiceApiHelper.verifyPan(panValidationRequest);
            boolean isPanValid = signzyResponse.getResult().getPanStatus().equalsIgnoreCase("VALID");
            return PanVerificationResponse.builder()
                    .name(signzyResponse.getResult().getName())
                    .isPanValid(isPanValid)
                    .panStatusCode(signzyResponse.getResult().getPanStatusCode())
                    .panStatus(signzyResponse.getResult().getPanStatus())
                    .build();
        }catch(Exception e) {
            log.error("error occurred while verifying pan details {}" ,e.getMessage());
            return PanVerificationResponse.builder()
                    .isPanValid(false)
                    .panStatus("NOT_FOUND")
                    .build();
        }
    }

    @Override
    public String getName() {
        return "SIGNZY";
    }
}
