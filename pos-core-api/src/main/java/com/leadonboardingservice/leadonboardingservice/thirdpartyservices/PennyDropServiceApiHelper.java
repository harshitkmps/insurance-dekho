package com.leadonboardingservice.leadonboardingservice.thirdpartyservices;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leadonboardingservice.leadonboardingservice.exceptions.PennyDropException;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import com.leadonboardingservice.leadonboardingservice.models.mongo.Logs;
import com.leadonboardingservice.leadonboardingservice.repositories.mongoposrepository.MongodbLogsRepository;
import com.leadonboardingservice.leadonboardingservice.services.PennyDropService;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.request.PennyDropRequestDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.BeneficiaryResponseDto;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response.PennyDropResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ConditionalOnProperty(name = "ide.stub.penny-drop-service", havingValue = "false", matchIfMissing = true)
@Service
@RequiredArgsConstructor
@Slf4j
public class PennyDropServiceApiHelper implements PennyDropService {

    private final GenericRestClient restClient;
    private final MongodbLogsRepository logsRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Value("${ide.penny-drop.host}")
    private String pennyDropHost;
    @Value("${ide.penny-drop.add-beneficiary-path}")
    private String addBeneficiaryPath;
    @Value("${ide.penny-drop.do-penny-drop-path}")
    private String doPennyDropPath;
    @Value("${ide.penny-drop.auth}")
    private String pennyDropAuth;

    public boolean insertLogs(Logs logs){
        log.debug("Inserting log in mongo");
        logsRepository.insert(logs);
        return true;
    }

    @SneakyThrows
    public BeneficiaryResponseDto addBeneficiary(PennyDropRequestDto pennyDropRequestDto){
        log.info("adding beneficiary for request {}", pennyDropRequestDto);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization","Basic "+pennyDropAuth);
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        RequestDetails requestDetails = new RequestDetails();
        requestDetails.setUrl(pennyDropHost+addBeneficiaryPath);
        requestDetails.setMethod(HttpMethod.POST);
        requestDetails.setHeaders(headers);
        BeneficiaryResponseDto beneficiaryResponseDto;
        try {
            log.info("adding beneficiary request {}", requestDetails);
            beneficiaryResponseDto = restClient.execute(requestDetails, pennyDropRequestDto, BeneficiaryResponseDto.class);
        }catch (Exception e){
            e.printStackTrace();
            throw new PennyDropException("Error while adding beneficiary"+e.getMessage());
        }
        Document document = new Document();
        document.append("Request_data", pennyDropRequestDto);
        document.append("Response_data", beneficiaryResponseDto);
        log.info("beneficiary Response "+beneficiaryResponseDto);
        Logs logs = new Logs(requestDetails.getUrl(),pennyDropRequestDto,beneficiaryResponseDto,LocalDateTime.now(),LocalDateTime.now());
        log.info("Calling Insert Method"+insertLogs(logs));
        return beneficiaryResponseDto;
    }

    @Override
    public PennyDropResponseDto addPennyDrop(String beneficiaryId) throws PennyDropException, JsonProcessingException {
        log.info("adding penny drop for beneficiaryId {}",beneficiaryId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization","Basic "+pennyDropAuth);
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        Map<String,String> body = new HashMap<>();
        body.put("amount", "1.0");
        body.put("beneficiaryid",beneficiaryId);
        body.put("purpose","validate agent account "+ LocalDateTime.now());
        RequestDetails requestDetails = new RequestDetails();
        requestDetails.setUrl(pennyDropHost+doPennyDropPath);
        requestDetails.setMethod(HttpMethod.POST);
        requestDetails.setHeaders(headers);
        Logs logs = null;
        try{
            PennyDropResponseDto pennyDropResponse = restClient.execute(requestDetails,body,PennyDropResponseDto.class);
            logs = new Logs(requestDetails.getUrl(),body,pennyDropResponse,LocalDateTime.now(),LocalDateTime.now());
            insertLogs(logs);
            return pennyDropResponse;
        } catch(HttpClientErrorException e){
            log.error("error while doing penny drop. {}",e.getMessage());
            String res= e.getResponseBodyAsString();
            PennyDropResponseDto pennyDropResponseDto = objectMapper.readValue(res,PennyDropResponseDto.class);
            logs = new Logs(requestDetails.getUrl(),body,pennyDropResponseDto,LocalDateTime.now(),LocalDateTime.now());
            insertLogs(logs);
            throw new PennyDropException(pennyDropResponseDto.getMsgFromBank());
        } catch (Exception e) {
            throw new RuntimeException("Error occurred during penny drop. "+e.getMessage());
        }
    }
}
