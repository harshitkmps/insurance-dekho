package com.leadonboardingservice.leadonboardingservice.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GenericResponse<T> {
    private int statusCode;
    private String message;
    private Error error;
    private T data;
}
