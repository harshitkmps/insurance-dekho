package com.leadonboardingservice.leadonboardingservice.externals.responsedtos;

import lombok.Data;

import java.util.List;
@Data
public class FraudSearchResponseDto {
    private Integer status;
    private String message;
    private List<String> data;
}
