package com.leadonboardingservice.leadonboardingservice.helpers;

import com.leadonboardingservice.leadonboardingservice.models.IAuditLog;
import com.leadonboardingservice.leadonboardingservice.models.LeadAuditLog;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditLogUtil {
    private final LeadAuditLogRepository leadAuditLogRepository;
    private final IamContextUtils iamContextUtils;

    public void LogIt(String action, IAuditLog entity){
        try {
            String createdBy = "";
            if(iamContextUtils.getIamUUID().isPresent()){
                createdBy = iamContextUtils.getIamUUID().get();
            } else {
                log.error("iam context utils is empty???");
            }
            if(StringUtils.isEmpty(MDC.get("requestId"))){
                log.error("requestId is empty????");
            }
            LeadAuditLog auditRecord = LeadAuditLog.builder()
                    .entityId(entity.getId())
                    .action(action)
                    .requestId(MDC.get("requestId"))
                    .detail(entity.toString())
                    .entityName(entity.getClass().getSimpleName())
                    .createdBy(createdBy)
                    .build();
            leadAuditLogRepository.save(auditRecord);

        } catch (Exception e){
            log.error("error during log audit {}", entity);
        }
    }
}
