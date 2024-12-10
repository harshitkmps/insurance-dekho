package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.exceptions.ValidationException;
import com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers.LeadEventHandlerFactory;
import com.leadonboardingservice.leadonboardingservice.services.LeadEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@Transactional(propagation = Propagation.SUPPORTS)
@RequiredArgsConstructor
public class LeadEventServiceImpl implements LeadEventService {
    private final LeadEventHandlerFactory eventHandlerFactory;

    @Override
    public void triggerEvent(LeadStatusEventRequestDto leadStatusEventRequestDto) throws ValidationException {
        eventHandlerFactory
                .getHandler(leadStatusEventRequestDto.getLeadTrigger())
                .handle(leadStatusEventRequestDto);
    }
}
