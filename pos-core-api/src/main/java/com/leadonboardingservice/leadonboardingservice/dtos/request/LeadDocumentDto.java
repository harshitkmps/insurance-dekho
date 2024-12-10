package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.leadonboardingservice.leadonboardingservice.enums.DocumentSources;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentStatus;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeadDocumentDto {
    @NotNull
    private DocumentType documentType;

    // default
    private DocumentSources documentSource;

    private String documentId;

    private Integer remarkId;
    private DocumentStatus status;

    private Boolean isReUploaded;

    private String origin;

}
