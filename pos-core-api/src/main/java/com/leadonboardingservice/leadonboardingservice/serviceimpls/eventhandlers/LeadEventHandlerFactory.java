package com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers;

import com.leadonboardingservice.leadonboardingservice.enums.LeadTrigger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
@Slf4j
public class LeadEventHandlerFactory {

    private final Map<LeadTrigger,LeadEventHandler> leadEventHandler;

    @Autowired
    public LeadEventHandlerFactory(Set<LeadEventHandler> leadEventHandlerList){
        leadEventHandler = new HashMap<>();
        leadEventHandlerList.forEach(x -> leadEventHandler.put(x.getName(), x));
    }

    public LeadEventHandler getHandler(LeadTrigger leadTrigger){
        if(leadEventHandler.containsKey(leadTrigger)){
            return leadEventHandler.get(leadTrigger);
        }
        throw new RuntimeException("no event handler found for lead");
    }
}
