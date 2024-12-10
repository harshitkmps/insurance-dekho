package com.leadonboardingservice.leadonboardingservice.serviceimpls.bankverificationhandlers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.BankVerificationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.BankVerificationResponseDto;
import com.leadonboardingservice.leadonboardingservice.exceptions.PennyDropException;
import com.leadonboardingservice.leadonboardingservice.externals.EncryptionServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.EncryptionRequest;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.EncryptionResponse;
import com.leadonboardingservice.leadonboardingservice.models.mongo.Logs;
import com.leadonboardingservice.leadonboardingservice.repositories.mongoposrepository.MongodbLogsRepository;
import com.leadonboardingservice.leadonboardingservice.services.AccountVerifier;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.SignzyServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.SignzyBankVerifyEssentialsDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.request.SignzyBankVerifyRequestDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.SignzyBankVerifyResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.Arrays;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class SignzyAccountService implements AccountVerifier {
    private final SignzyServiceApiHelper signzyServiceApiHelper;
    private final EncryptionServiceApiHelper encryptionServiceApiHelper;
    private final MongodbLogsRepository logsRepository;

    @Value("${ide.signzy.host}")
    private String host;
    @Value("${ide.signzy.path}")
    private String path;
    @Value("${ide.bankVerification.name-score}")
    private String nameScore;

    public boolean insertLogs(Logs logs){
        log.debug("Inserting log in mongo");
        logsRepository.insert(logs);
        return true;
    }
    @Override
    public BankVerificationResponseDto verifyAccount(BankVerificationRequestDto bankVerificationRequestDto) throws PennyDropException {
        try {
            SignzyBankVerifyEssentialsDto essentialsDto = SignzyBankVerifyEssentialsDto.builder()
                    .beneficiaryAccount(bankVerificationRequestDto.getBeneficiaryAccountNumber())
                    .beneficiaryIFSC(bankVerificationRequestDto.getBeneficiaryIFSC())
                    .beneficiaryName(bankVerificationRequestDto.getBeneficiaryName())
                    .nameFuzzy("true")
                    .nameMatchScore(nameScore)
                    .build();
            SignzyBankVerifyRequestDto requestDto = SignzyBankVerifyRequestDto.builder()
                    .task("bankTransfer")
                    .essentials(essentialsDto)
                    .leadUUID(bankVerificationRequestDto.getUuid())
                    .build();
            SignzyBankVerifyResponseDto response = signzyServiceApiHelper.bankVerify(requestDto);
            try{
                EncryptionResponse encryptionResponse = encryptionServiceApiHelper.encrypt(EncryptionRequest.builder().data(Arrays.asList(bankVerificationRequestDto.getBeneficiaryAccountNumber())).build());
                bankVerificationRequestDto.setBeneficiaryAccountNumber(encryptionResponse.getData().get(0).getEncrypted());
                String url = host + path + "/bankaccountverifications";
                Logs logs = new Logs(url,bankVerificationRequestDto,response, LocalDateTime.now(),LocalDateTime.now());
                insertLogs(logs);
            } catch(Exception e) {
                e.printStackTrace();
                log.error("Error while saving log in mongo {}",e.getMessage());
            }
            if (response.getResult().getBankTransfer() != null) {
                boolean isBankVerified = response.getResult()
                        .getBankTransfer()
                        .getResponse().equalsIgnoreCase("Transaction Successful");
                return BankVerificationResponseDto.builder()
                        .beneficiaryAccount(bankVerificationRequestDto.getBeneficiaryAccountNumber())
                        .beneNameAtBank(response.getResult().getBankTransfer().getBeneName())
                        .beneficiaryIFSC(response.getResult().getBankTransfer().getBeneIFSC())
                        .isBankVerified(isBankVerified)
                        .isAccountActive(response.getResult().getActive())
                        .messageFromBank(response.getResult().getReason())
                        .message(response.getResult().getReason())
                        .nameMatch(response.getResult().getNameMatch())
                        .build();
            } else {
                String displayMessage ="The bank account provided is blocked. Please provide alternate bank account details or consider reaching out the respective bank to get the blocking checked";
                return BankVerificationResponseDto.builder()
                        .isBankVerified(false)
                        .isAccountActive(response.getResult().getActive())
                        .messageFromBank(response.getResult().getReason())
                        .message(displayMessage)
                        .nameMatch("no")
                        .build();
            }
        } catch (HttpClientErrorException httpClientErrorException) {
            log.error("error while verifying bank account " + httpClientErrorException.getMessage());
            throw new PennyDropException("error while verifying bank account " + httpClientErrorException.getMessage());
        }
    }

    @Override
    public String getName() {
        return "SIGNZY";
    }
}
