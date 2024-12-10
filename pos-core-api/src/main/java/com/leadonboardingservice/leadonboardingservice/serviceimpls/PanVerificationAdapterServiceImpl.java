package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.dtos.response.PanValidationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.PanVerificationResponse;
import com.leadonboardingservice.leadonboardingservice.services.PanVerificationAdapterService;
import com.leadonboardingservice.leadonboardingservice.services.PanVerifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class PanVerificationAdapterServiceImpl implements PanVerificationAdapterService {

    @Value("${ide.panVerification.vendor}")
    private String panVerificationVendor;
    private final List<PanVerifier> panVerifierList;

    @Override
    public PanVerificationResponse verifyPan(PanValidationRequestDto panVerificationRequestDto) {
        log.info("calling Pan verifier for request {}", panVerificationRequestDto);
        return getPanVerifier(panVerifierList).verifyPan(panVerificationRequestDto);
    }

    private PanVerifier getPanVerifier(List<PanVerifier> panVerifierList) {
        return panVerifierList.stream()
                .filter(a -> a.getName().equalsIgnoreCase(panVerificationVendor))
                .collect(Collectors.toList()).get(0);
    }
}
