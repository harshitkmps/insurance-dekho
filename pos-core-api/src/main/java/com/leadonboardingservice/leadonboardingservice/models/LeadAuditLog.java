package com.leadonboardingservice.leadonboardingservice.models;

import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Builder
@Table(name = "lead_audit_log")
public class LeadAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String action;
    private String detail;
    private String requestId;
    @Column(name="created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    private Long entityId;
    private String entityName;
    private String createdBy;
}
