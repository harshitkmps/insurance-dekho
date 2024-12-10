package com.leadonboardingservice.leadonboardingservice.config;

import com.leadonboardingservice.leadonboardingservice.enums.LeadEvent;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
@Component
@Slf4j
@ConfigurationProperties(prefix = "es-lead")
public class EsLeadEventsMapConfig {

    @Setter
    private String events;

    @Getter
    private final Map<LeadEvent, String> leadEventsToStoreInEs = new HashMap<>();

    @PostConstruct
    public void init() {
        String[] pairs = events.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":");
            String key = keyValue[0];
            String value = keyValue[1];
            try {
                LeadEvent eventKey = LeadEvent.valueOf(key);
                leadEventsToStoreInEs.put(eventKey, value);
            } catch (IllegalArgumentException e) {
                log.debug("Skipping invalid LeadEvent key: {}, message: {}", key, e.getMessage());
            }
        }
    }
}
