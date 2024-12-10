package com.leadonboardingservice.leadonboardingservice.exceptions;

import java.util.List;

public class ValidationException extends Exception{
    private static final long serialVersionUID = 1L;

    public ValidationException(String message){
        super(message);
    }

    public ValidationException(List<String> stringList) {
        super(String.join(",",stringList));
    }
}
