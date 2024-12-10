package com.leadonboardingservice.leadonboardingservice.serviceimpls.bankverificationhandlers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.BankVerificationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.BankVerificationResponseDto;
import com.leadonboardingservice.leadonboardingservice.exceptions.PennyDropException;
import com.leadonboardingservice.leadonboardingservice.services.AccountVerifier;
import com.leadonboardingservice.leadonboardingservice.services.PennyDropService;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.request.PennyDropRequestDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.BeneficiaryResponseDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.PennyDropResponseDto;
import io.micrometer.core.instrument.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PennyDropAccountService implements AccountVerifier {
    private final PennyDropService pennyDropServiceApiHelper;
    @Override
    public BankVerificationResponseDto verifyAccount(BankVerificationRequestDto bankVerificationRequestDto) throws PennyDropException {
        try {
            PennyDropRequestDto pennyDropRequestDto = PennyDropRequestDto.builder()
                    .fullname(bankVerificationRequestDto.getBeneficiaryName())
                    .beneficiarymobileno(bankVerificationRequestDto.getBeneficiaryMobile())
                    .beneficiaryaccountno(bankVerificationRequestDto.getBeneficiaryAccountNumber())
                    .beneficiaryifsc(bankVerificationRequestDto.getBeneficiaryIFSC())
                    .emailid(bankVerificationRequestDto.getBeneficiaryEmail())
                    .address(bankVerificationRequestDto.getBeneficiaryAddress())
                    .build();
            BeneficiaryResponseDto beneficiaryResponseDto = pennyDropServiceApiHelper.addBeneficiary(pennyDropRequestDto);
            if (beneficiaryResponseDto.getIsMethodSuccessfullyExecuted() &&
                    beneficiaryResponseDto.getResponse().getBeneficiaryId() != null &&
                    !beneficiaryResponseDto.getResponse().getBeneficiaryId().isEmpty()) {
                PennyDropResponseDto pennyDropResponseDto = pennyDropServiceApiHelper.addPennyDrop(beneficiaryResponseDto.getResponse().getBeneficiaryId());
                if (pennyDropResponseDto.getIsMethodSuccessfullyExecuted()) {
                    if (!StringUtils.isEmpty(pennyDropResponseDto.getBeneficiaryId())
                            && pennyDropResponseDto.getResponse() != null
                            && pennyDropResponseDto.getResponse().getStartTransferResponse() != null) {
                        if (StringUtils.isEmpty(pennyDropResponseDto.getResponse().getStartTransferResponse().getBenefNameAtBank())) {
                            throw new PennyDropException("Beneficiary name at bank is empty");
                        }
                        return BankVerificationResponseDto.builder()
                                .isBankVerified(true)
                                .beneNameAtBank(pennyDropResponseDto.getResponse().getStartTransferResponse().getBenefNameAtBank())
                                .build();
                    }
                }
            }
            throw new PennyDropException("Error occurred while adding beneficiary "+beneficiaryResponseDto.getResponse() + beneficiaryResponseDto.getIsMethodSuccessfullyExecuted());
        } catch (Exception e) {
            e.printStackTrace();
            log.error("error while verifying bank account " + e.getMessage());
            throw new PennyDropException("error while verifying bank account " + e.getMessage());
        }
    }

    @Override
    public String getName() {
        return "PENNYSERVICE";
    }
}
