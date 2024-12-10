package com.leadonboardingservice.leadonboardingservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leadonboardingservice.leadonboardingservice.models.mongo.Logs;
import com.leadonboardingservice.leadonboardingservice.repositories.mongoposrepository.MongodbLogsRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;

import java.time.LocalDateTime;

@Aspect
@Component
@Slf4j
public class MongoDBLogAspect {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Around("@annotation(MongoDBLog)")
    public Object log(ProceedingJoinPoint joinPoint) throws Throwable{
        MongodbLogsRepository logsRepository = SpringContext.getBean(MongodbLogsRepository.class);
        log.info("inside mongoDb log aspect");
        Logs logs = new Logs(null,joinPoint.getArgs(),null, LocalDateTime.now(),LocalDateTime.now());
        logs = logsRepository.save(logs);
        try {
            Object proceed = joinPoint.proceed();
            logs.setResponse_data(proceed);
            return proceed;
        } catch (Throwable e) {
            logs.setResponse_data(e.toString());
            throw e;
        }finally {
            logs.setUpdated_at(LocalDateTime.now());
            logsRepository.save(logs);
        }
    }

}
