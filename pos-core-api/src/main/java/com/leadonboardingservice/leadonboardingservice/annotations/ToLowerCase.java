package com.leadonboardingservice.leadonboardingservice.annotations;

import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.leadonboardingservice.leadonboardingservice.config.processor.LowerCaseConverter;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotationsInside
@JsonSerialize(converter = LowerCaseConverter.class)
@JsonDeserialize(converter = LowerCaseConverter.class)
public @interface ToLowerCase {
}
