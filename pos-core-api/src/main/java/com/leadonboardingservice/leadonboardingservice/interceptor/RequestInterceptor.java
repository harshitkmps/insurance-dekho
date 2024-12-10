package com.leadonboardingservice.leadonboardingservice.interceptor;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Enumeration;
import java.util.UUID;

@Slf4j
@Component
public class RequestInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle
            (HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        log.debug("inside preHandle");
        Enumeration headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String key = (String) headerNames.nextElement();
            String value = request.getHeader(key);
            if(!StringUtils.isEmpty(key) && key.equalsIgnoreCase("x-correlation-id")) {
                MDC.put(key, value);
            }
        }
        MDC.put("requestId", String.valueOf(UUID.randomUUID()));
        log.debug("returning from RequestInterceptor preHandle  method. MDC map {}",MDC.getCopyOfContextMap());
        return true;
    }
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response,
                           Object handler, ModelAndView modelAndView) throws Exception {
        MDC.clear();
        log.debug("Post Handle method is Calling"+MDC.getCopyOfContextMap());
    }
    @Override
    public void afterCompletion
            (HttpServletRequest request, HttpServletResponse response, Object
                    handler, Exception exception) throws Exception {

        log.debug("Request and Response is completed");
    }
}
