package com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.LeadTrigger;
import com.leadonboardingservice.leadonboardingservice.exceptions.ValidationException;

public interface LeadEventHandler {

    void handle(LeadStatusEventRequestDto leadUUID) throws ValidationException;

    LeadTrigger getName();
}
