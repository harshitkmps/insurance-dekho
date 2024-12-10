package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.stub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leadonboardingservice.leadonboardingservice.dtos.request.BankVerificationRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.BankVerificationResponseDto;
import com.leadonboardingservice.leadonboardingservice.exceptions.PennyDropException;
import com.leadonboardingservice.leadonboardingservice.models.mongo.Logs;
import com.leadonboardingservice.leadonboardingservice.repositories.mongoposrepository.MongodbLogsRepository;
import com.leadonboardingservice.leadonboardingservice.services.AccountVerifier;
import com.leadonboardingservice.leadonboardingservice.services.PennyDropService;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.request.PennyDropRequestDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.BeneficiaryResponseDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.PennyDropResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@ConditionalOnProperty(name = "ide.stub.penny-drop-service", havingValue = "true")
@Service
@Slf4j
@RequiredArgsConstructor
public class PennyDropStubServiceApiHelper implements PennyDropService, AccountVerifier {
    private final MongodbLogsRepository logsRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    public boolean insertLogs(Logs logs){
        log.debug("Inserting log in mongo");
        logsRepository.insert(logs);
        return true;
    }
    public PennyDropResponseDto doPennyDrop(PennyDropRequestDto pennyDropRequestDto) throws PennyDropException {
        PennyDropResponseDto pennyDropStubResponseDto = new PennyDropResponseDto();
        pennyDropStubResponseDto.setIsMethodSuccessfullyExecuted(true);
        PennyDropResponseDto.PennyDropResponse pennyDropResponse = new PennyDropResponseDto.PennyDropResponse();
        PennyDropResponseDto.PennyDropTransferResponse pennyDropTransferResponse = new PennyDropResponseDto.PennyDropTransferResponse();
        pennyDropTransferResponse.setBenefNameAtBank("test stub beneficiary name");
        pennyDropStubResponseDto.setBeneficiaryId(UUID.randomUUID().toString());
        pennyDropResponse.setStartTransferResponse(pennyDropTransferResponse);
        pennyDropStubResponseDto.setResponse(pennyDropResponse);
        return pennyDropStubResponseDto;
    }

    @Override
    public BeneficiaryResponseDto addBeneficiary(PennyDropRequestDto pennyDropRequestDto) throws PennyDropException {
        BeneficiaryResponseDto beneficiaryResponseDto = new BeneficiaryResponseDto();
        beneficiaryResponseDto.setIsMethodSuccessfullyExecuted(true);
        BeneficiaryResponseDto.BeneficiaryResponse beneficiaryResponse = new BeneficiaryResponseDto.BeneficiaryResponse();
        beneficiaryResponse.setBeneficiaryId(UUID.randomUUID().toString());
        beneficiaryResponseDto.setResponse(beneficiaryResponse);
        return beneficiaryResponseDto;
    }


    @Override
    public PennyDropResponseDto addPennyDrop(String beneficiaryId) throws PennyDropException {
        Logs logs = null;
        Map<String,String> body = new HashMap<>();
        body.put("amount", "1.0");
        body.put("beneficiaryid",beneficiaryId);
        body.put("purpose","validate agent account "+ LocalDateTime.now());

        try{
           // PennyDropResponseDto pennyDropResponse = restClient.execute(requestDetails,body,PennyDropResponseDto.class);
            PennyDropResponseDto pennyDropStubResponseDto = new PennyDropResponseDto();
            pennyDropStubResponseDto.setBeneficiaryId(UUID.randomUUID().toString());
            pennyDropStubResponseDto.setIsMethodSuccessfullyExecuted(true);
            PennyDropResponseDto.PennyDropResponse pennyDropResponse = new PennyDropResponseDto.PennyDropResponse();
            PennyDropResponseDto.PennyDropTransferResponse pennyDropTransferResponse = new PennyDropResponseDto.PennyDropTransferResponse();
            pennyDropTransferResponse.setBenefNameAtBank("test stub beneficiary name");
            pennyDropResponse.setStartTransferResponse(pennyDropTransferResponse);
            pennyDropStubResponseDto.setResponse(pennyDropResponse);
            logs = new Logs("www.test.pennydrop",body,pennyDropResponse,LocalDateTime.now(),LocalDateTime.now());
            insertLogs(logs);
            //throw new HttpClientErrorException(HttpStatus.BAD_GATEWAY,"");
            return pennyDropStubResponseDto;
        } catch(HttpClientErrorException e){
            log.error("error while doing penny drop. {}",e.getMessage());
            String res= e.getResponseBodyAsString();
            //PennyDropResponseDto pennyDropResponseDto = objectMapper.readValue(res,PennyDropResponseDto.class);
            PennyDropResponseDto pennyDropStubResponseDto = new PennyDropResponseDto();
            pennyDropStubResponseDto.setBeneficiaryId(UUID.randomUUID().toString());
            pennyDropStubResponseDto.setIsMethodSuccessfullyExecuted(true);
            pennyDropStubResponseDto.setMsgFromBank("Account Error");
            PennyDropResponseDto.PennyDropResponse pennyDropResponse = new PennyDropResponseDto.PennyDropResponse();
            PennyDropResponseDto.PennyDropTransferResponse pennyDropTransferResponse = new PennyDropResponseDto.PennyDropTransferResponse();
            pennyDropTransferResponse.setBenefNameAtBank("test stub beneficiary name");
            pennyDropResponse.setStartTransferResponse(pennyDropTransferResponse);
            pennyDropStubResponseDto.setResponse(pennyDropResponse);
            logs = new Logs("www.test.pennydrop",body,pennyDropStubResponseDto,LocalDateTime.now(),LocalDateTime.now());
            insertLogs(logs);
            throw new PennyDropException("Error occurred during penny drop. "+pennyDropStubResponseDto.getMsgFromBank());
        }

    }

    @Override
    public BankVerificationResponseDto verifyAccount(BankVerificationRequestDto requestDto) throws PennyDropException {
        return BankVerificationResponseDto.builder()
                .beneNameAtBank("stub beneficiary name")
                .isBankVerified(true)
                .nameMatch("yes")
                .build();
    }

    @Override
    public String getName() {
        return "PENNYDROPSTUB";
    }
}
