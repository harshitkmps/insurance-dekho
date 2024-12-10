package com.leadonboardingservice.leadonboardingservice.config;

import com.leadonboardingservice.leadonboardingservice.exceptions.LimitExceedException;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.serviceimpls.RateLimitingServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
@Component
@Slf4j
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {
    private final LeadRepository leadRepository;
    private final RateLimitingServiceImpl rateLimitingService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.info("inside rate limit filter");
        try {
            rateLimitingService.resolve(StringUtils.substringAfter(request.getServletPath(),"ckyc/"));
        } catch (LimitExceedException e) {
            ((HttpServletResponse) response).sendError(HttpStatus.TOO_MANY_REQUESTS.value(), e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            log.error("error while getting data from redis");
        }
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return !path.startsWith("/api/v1/leads/ckyc/");
    }
}
