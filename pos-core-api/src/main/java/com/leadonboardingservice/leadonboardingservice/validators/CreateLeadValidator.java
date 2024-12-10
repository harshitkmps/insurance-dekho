package com.leadonboardingservice.leadonboardingservice.validators;

import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateLeadRequestDto;

import java.util.Optional;

@FunctionalInterface
public interface CreateLeadValidator {
    Optional<String> validate(final CreateLeadRequestDto createLeadRequestDto);
}
