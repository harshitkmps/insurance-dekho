package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.externals.DocumentServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.DocumentServiceResponseDto;
import com.leadonboardingservice.leadonboardingservice.models.Document;
import com.leadonboardingservice.leadonboardingservice.thirdpartyservices.AwsS3ServiceApiHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeadRegisterDocumentServiceImpl {

    private final DocumentServiceApiHelper documentServiceApiHelper;
    private final AwsS3ServiceApiHelper awsServiceHelper;
    @Value("${ide.document-service.host}")
    private String host;

    public void registerOldDocUrls(List<Document> documents) {
        if( documents == null ){
            return;
        }
        log.info("registering old document url in document service for hybrid approach");
        Map<Long,String> docUrlsMap = new LinkedHashMap<>();
        documents.forEach(document -> {
            if(document.getDocumentId() == null && document.getUrl() != null){
                DocumentServiceResponseDto documentServiceResponseDto = awsServiceHelper.uploadToDocService(document.getUrl());
                if(documentServiceResponseDto != null && documentServiceResponseDto.getData() != null && !StringUtils.isEmpty(documentServiceResponseDto.getData().getDocId())) {
                    document.setDocumentId(documentServiceResponseDto.getData().getDocId());
                }
            }
            if(document.getDocumentId() == null && document.getUrl() != null){
                docUrlsMap.put(document.getId(),document.getUrl());
            }
        });
        if(docUrlsMap.isEmpty()){
            return;
        }
        Map<Long,String> responseMap = documentServiceApiHelper.registerDocument(docUrlsMap);
        documents.forEach(document -> {
            if(responseMap.containsKey(document.getId())){
                document.setTempDocUrl(host+"/doc-service/v1/documents/"+responseMap.get(document.getId()));
            }
        });
    }
}
