package com.leadonboardingservice.leadonboardingservice.externals;

import com.leadonboardingservice.leadonboardingservice.externals.dtos.DocumentServiceResponseDto;
import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.DocumentServiceRequestDto;
import com.leadonboardingservice.leadonboardingservice.externals.responsedtos.DocumentsResponseDto;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import com.leadonboardingservice.leadonboardingservice.helpers.IamContextUtils;
import com.leadonboardingservice.leadonboardingservice.helpers.RequestDetails;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentServiceApiHelper {
    
    private final GenericRestClient restClient;
    @Value("${ide.document-service.host}")
    private String host;
    @Value("${ide.document-service.register-documents}")
    private String registerPath;
    @Value("${ide.document-service.upload-documents}")
    private String uploadDocumentPath;
    @Value("${ide.document-service.x-api-key}")
    private String documentServiceXApiKey;
    private final IamContextUtils iamContextUtils;

    @SneakyThrows
    public DocumentServiceResponseDto uploadDocument(String path){
        log.info("uploading file in document service for path {}",path);
        FileSystemResource value = new FileSystemResource(new File(new ClassPathResource(path).getPath()));
        log.info("uploading in document service {} FileName {}",value.getPath(),value.getFilename());
        HttpHeaders headers = new HttpHeaders();
        headers.add("x-api-key",documentServiceXApiKey);
        headers.add("Authorization","Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwOlwvXC9pYW0uaW5zdXJhbmNlZGVraG8ubG9jYWwiLCJhdWQiOiJodHRwOlwvXC9pYW0uaW5zdXJhbmNlZGVraG8ubG9jYWwiLCJpYXQiOjE2Mzg0MTU5ODksIm5iZiI6MTYzODQxNTk4OSwiZXhwIjoxNjQxMDA3OTg5LCJkYXRhIjp7InJvbGVzIjpbXSwidXVpZCI6ImY1YTJjMjIwLWNmOGEtNGYzYi1hNTg5LTllNWNhYjIyN2RiYiIsImVtYWlsIjpudWxsLCJtb2JpbGUiOiI5OTk5NDY3NDg4In19.mFT35TrlOngJdIu-JU1iZXMZofV9gWYXg8oL0ZSSLqNtblDB2Um41oJ02FaIWInyXFwFjoaPxKjwZ_HOg8ly3A");
        headers.add("content-type", MediaType.MULTIPART_FORM_DATA_VALUE);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("document", value);
        body.add("doc_owner_uuid","owner");
        String serverUrl = host+uploadDocumentPath;
        RequestDetails requestDetails = new RequestDetails();
        requestDetails.setHeaders(headers);
        requestDetails.setMethod(HttpMethod.POST);
        requestDetails.setUrl(serverUrl);
        DocumentServiceResponseDto responseDto = restClient.execute(requestDetails,body, DocumentServiceResponseDto.class);
        log.info("document service upload response {}",responseDto);
        return responseDto;
    }

    public void test(){
        FileSystemResource value = new FileSystemResource(new File("imgFile.getFile().getAbsolutePath()"));
        HttpHeaders headers = new HttpHeaders();
        headers.add("x-api-key","3NrGnLdHs8DtQDFAMu86SFs-g__PdpXWLHpT_mFvKVNo55fREVX6RZ8nqnltWZe3RlASYrv6U7oh6oMtlGJ5_w");
        headers.add("Authorization","Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwOlwvXC9pYW0uaW5zdXJhbmNlZGVraG8ubG9jYWwiLCJhdWQiOiJodHRwOlwvXC9pYW0uaW5zdXJhbmNlZGVraG8ubG9jYWwiLCJpYXQiOjE2Mzg0MTU5ODksIm5iZiI6MTYzODQxNTk4OSwiZXhwIjoxNjQxMDA3OTg5LCJkYXRhIjp7InJvbGVzIjpbXSwidXVpZCI6ImY1YTJjMjIwLWNmOGEtNGYzYi1hNTg5LTllNWNhYjIyN2RiYiIsImVtYWlsIjpudWxsLCJtb2JpbGUiOiI5OTk5NDY3NDg4In19.mFT35TrlOngJdIu-JU1iZXMZofV9gWYXg8oL0ZSSLqNtblDB2Um41oJ02FaIWInyXFwFjoaPxKjwZ_HOg8ly3A");
        headers.add("content-type", MediaType.MULTIPART_FORM_DATA_VALUE);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("document", value);
        body.add("doc_owner_uuid","owner");
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String serverUrl = "https://documentservicestaging.insurancedekho.com/doc-service/v1/documents";

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate
                .postForEntity(serverUrl, requestEntity, String.class);
    }

    public Map<Long, String> registerDocument(Map<Long, String> docUrlsMap) {
        log.debug("building registerDocuments request for documents {}",docUrlsMap);
        List<String> docUrls = new ArrayList<>();
        for(Map.Entry<Long,String> map: docUrlsMap.entrySet()){
            docUrls.add(map.getValue());
        }
        DocumentServiceRequestDto documentServiceRequestDto = DocumentServiceRequestDto.builder().urls(docUrls).build();
        DocumentsResponseDto documentServiceResponseDto = registerDocuments(documentServiceRequestDto);
        int i = 0;
        for(Map.Entry<Long,String> map: docUrlsMap.entrySet()){
            docUrlsMap.put(map.getKey(),documentServiceResponseDto.getData().getDocs().get(i));
            i++;
        }
        return docUrlsMap;
    }

    @SneakyThrows
    private DocumentsResponseDto registerDocuments(DocumentServiceRequestDto documentServiceRequestDto) {
        log.info("generating virtual docIds for request {}",documentServiceRequestDto);
        String url = host+registerPath;
        HttpHeaders headers = new HttpHeaders();
        headers.add("x-api-key",documentServiceXApiKey);
        Optional<String> authHeader = iamContextUtils.getAuthorizationHeader();
        if(authHeader.isPresent()) {
            headers.add("Authorization", authHeader.get());
        } else {
            throw new RuntimeException("unable to register documents as auth-header is not present");
        }
        RequestDetails requestDetails = new RequestDetails();
        requestDetails.setHeaders(headers);
        requestDetails.setMethod(HttpMethod.POST);
        requestDetails.setUrl(url);
        DocumentsResponseDto documentsResponseDto = restClient.execute(requestDetails,documentServiceRequestDto,DocumentsResponseDto.class);
        log.info("documents response received {}",documentsResponseDto);
        return documentsResponseDto;
    }
}
