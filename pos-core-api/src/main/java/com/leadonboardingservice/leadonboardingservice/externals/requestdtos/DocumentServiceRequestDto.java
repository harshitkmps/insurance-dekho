package com.leadonboardingservice.leadonboardingservice.externals.requestdtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class DocumentServiceRequestDto {
    private List<String> urls;
}
