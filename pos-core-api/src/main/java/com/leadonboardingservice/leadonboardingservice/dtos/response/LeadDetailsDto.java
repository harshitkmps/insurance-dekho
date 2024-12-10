package com.leadonboardingservice.leadonboardingservice.dtos.response;

import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class LeadDetailsDto {
    private String name;

    private String uuid;

    private String mobileMasked;

    private String mobileEncrypted;

    private String emailMasked;

    private String emailEncrypted;

    private LeadStatus status;

    private Integer cityId;

    private Boolean isWhatsappConsent;

    private String referrerUserId;

    private String assignedSalesUserId;

    private String rejectionReason;

    private String rejectionRemarksId;
    
    private String irdaId;

    private LocalDate irdaReportingDate;

    private Integer tenantId;
}
