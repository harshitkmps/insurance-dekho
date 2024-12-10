package com.leadonboardingservice.leadonboardingservice.config.processor;

import com.fasterxml.jackson.databind.util.StdConverter;
import com.leadonboardingservice.leadonboardingservice.annotations.ToLowerCase;

public class UpperCaseConvertor extends StdConverter<String, String> {
    @Override
    public String convert(String value) {
        if (value == null) {
            return null;
        }
        return value.toUpperCase();
    }
}
