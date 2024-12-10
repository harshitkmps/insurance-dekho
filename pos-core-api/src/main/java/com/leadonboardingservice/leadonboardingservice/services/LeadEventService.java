package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.exceptions.ValidationException;

public interface LeadEventService {
    void triggerEvent(LeadStatusEventRequestDto leadStatusEventRequestDto) throws ValidationException;
}
