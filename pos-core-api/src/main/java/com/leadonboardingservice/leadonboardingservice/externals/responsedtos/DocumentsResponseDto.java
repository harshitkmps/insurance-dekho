package com.leadonboardingservice.leadonboardingservice.externals.responsedtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.DocumentServiceDto;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.MetaData;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DocumentsResponseDto {
    private MetaData metaData;
    private DocumentServiceDto data;
}
