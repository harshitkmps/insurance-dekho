package com.leadonboardingservice.leadonboardingservice.externals.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DocumentServiceDto {

    private List<String> docs;
}
