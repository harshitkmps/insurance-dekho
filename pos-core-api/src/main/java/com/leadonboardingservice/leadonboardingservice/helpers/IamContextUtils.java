package com.leadonboardingservice.leadonboardingservice.helpers;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
public class IamContextUtils {

    public Optional<String> getIamUUID(){
        SecurityContext context = SecurityContextHolder.getContext();
        if(context != null) {
            Authentication authentication = context.getAuthentication();
            if(authentication != null) {
                Object iamDetails = authentication.getPrincipal();
                if (iamDetails instanceof Map) {
                    String iamUUID = ((Map<String, Object>) iamDetails).get("uuid").toString();
                    return Optional.of(iamUUID);
                }
            }
        }
        return Optional.empty();
    }

    public Optional<String> getAuthorizationHeader(){
        SecurityContext context = SecurityContextHolder.getContext();
        if(context != null) {
            Authentication authentication = context.getAuthentication();
            if(authentication != null) {
                Object iamDetails = authentication.getPrincipal();
                if (iamDetails instanceof Map) {
                    String iamUUID = ((Map<String, Object>) iamDetails).get("authorization").toString();
                    return Optional.of(iamUUID);
                }
            }
        }
        return Optional.empty();
    }
}
