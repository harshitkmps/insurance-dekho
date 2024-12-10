package com.leadonboardingservice.leadonboardingservice.annotations;

import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.leadonboardingservice.leadonboardingservice.config.processor.UpperCaseConvertor;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotationsInside
@JsonSerialize(converter = UpperCaseConvertor.class)
@JsonDeserialize(converter = UpperCaseConvertor.class)
public @interface ToUpperCase {
}
