package com.leadonboardingservice.leadonboardingservice.exceptions;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
public class DownstreamAPIException extends Exception{
    private static final long serialVersionUID = 1L;

    private HttpStatus httpStatus;

    public DownstreamAPIException(String message){
        super(message);
    }

    public DownstreamAPIException(String message, HttpStatus httpStatus){
        super(message);
        this.httpStatus = httpStatus;
    }
}
