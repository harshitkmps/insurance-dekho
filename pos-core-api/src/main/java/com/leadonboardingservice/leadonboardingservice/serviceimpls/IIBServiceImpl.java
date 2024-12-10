package com.leadonboardingservice.leadonboardingservice.serviceimpls;
import com.leadonboardingservice.leadonboardingservice.dtos.response.IRDAIRegistrationResponse;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import com.leadonboardingservice.leadonboardingservice.models.mongo.Logs;
import com.leadonboardingservice.leadonboardingservice.repositories.mongoposrepository.MongodbLogsRepository;
import com.leadonboardingservice.leadonboardingservice.services.IIBService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class IIBServiceImpl implements IIBService {
    private final GenericRestClient restClient;
    private final MongodbLogsRepository logsRepository;
    @Value("${ide.iib.host}")
    private String iibHost;
    @Value("${ide.iib.path}")
    private String iibPath;

    public IRDAIRegistrationResponse getIIBRegistration(String pan) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.add("content-type", MediaType.APPLICATION_JSON_VALUE);
        RequestDetails requestDetails = new RequestDetails();
        requestDetails.setUrl( iibHost + iibPath);
        requestDetails.setMethod(HttpMethod.POST);
        requestDetails.setHeaders(headers);
        Map<String,Object> requestMap = new HashMap<>();
        List<String> pans = new ArrayList<>();
        pans.add(pan);
        requestMap.put("panNos", pans);
        try {
            Logs logs = new Logs(iibHost + iibPath, requestMap, null, LocalDateTime.now(), LocalDateTime.now());
            IRDAIRegistrationResponse response = restClient.execute(requestDetails, requestMap, IRDAIRegistrationResponse.class);
            logs.setUpdated_at(LocalDateTime.now());
            logs.setResponse_data(response);
            log.debug("Inserting log in mongo");
            logsRepository.insert(logs);
            log.info("Response received from IIB Automation Service {}", response);
            return response;
        } catch (Exception e){
            Logs logs = new Logs(iibHost + iibPath, requestMap, e.getMessage(), LocalDateTime.now(), LocalDateTime.now());
            log.error("Error in IIB automation api {}", e.getMessage());
            logsRepository.insert(logs);
            throw new RuntimeException("Some error occured in checking IIB registration for PAN " + pan);
        }
    }
}
