package com.leadonboardingservice.leadonboardingservice.dtos.response;

import com.leadonboardingservice.leadonboardingservice.enums.DocumentSources;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentStatus;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DocumentDto {
    private DocumentType type;
    private DocumentSources source;

    private String documentId;

    private String url;

    private DocumentStatus status;

    private Integer remarkId;

    private LocalDateTime verifiedAt;

    private Boolean isReUploaded;
}
