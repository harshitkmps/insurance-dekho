package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.dtos.request.BankVerificationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.BankVerificationResponseDto;
import com.leadonboardingservice.leadonboardingservice.exceptions.PennyDropException;
import com.leadonboardingservice.leadonboardingservice.services.AccountVerifier;
import com.leadonboardingservice.leadonboardingservice.services.BankVerificationAdapterService;
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
public class BankVerificationAdapterServiceImpl implements BankVerificationAdapterService {

    @Value("${ide.bankVerification.vendor}")
    private String bankVerificationVendor;
    private final List<AccountVerifier> accountVerifierList;

    @Override
    public BankVerificationResponseDto verifyAccount(BankVerificationRequestDto bankVerificationRequestDto) throws PennyDropException {
        try {
            log.info("calling Account verifier for request {}", bankVerificationRequestDto);
            return getAccountVerifier(accountVerifierList)
                    .verifyAccount(bankVerificationRequestDto);
        }catch (Exception e){
            e.printStackTrace();
            log.error("error while verifying bank account "+e.getMessage());
            return BankVerificationResponseDto.builder()
                    .isBankVerified(false)
                    .beneNameAtBank(null)
                    .nameMatch("no")
                    .messageFromBank(e.getMessage())
                    .message("The bank details you entered could not be verified. Please share alternate account details and register the lead")
                    .build();
        }
    }

    private AccountVerifier getAccountVerifier(List<AccountVerifier> accountVerifierList) {
       return accountVerifierList.stream()
                .filter(a -> a.getName().equalsIgnoreCase(bankVerificationVendor))
                .collect(Collectors.toList()).get(0);

    }
}
