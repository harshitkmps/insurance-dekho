package com.leadonboardingservice.leadonboardingservice.validators;

import com.leadonboardingservice.leadonboardingservice.models.Lead;

import java.util.Optional;

@FunctionalInterface
public interface ConvertLeadValidator {
    Optional<String> validate(final Lead lead);
}
