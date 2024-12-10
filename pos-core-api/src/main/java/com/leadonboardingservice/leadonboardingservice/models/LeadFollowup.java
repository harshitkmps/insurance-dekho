package com.leadonboardingservice.leadonboardingservice.models;

import com.leadonboardingservice.leadonboardingservice.enums.LeadFollowupStatuses;
import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.time.LocalDateTime;

@Table(name = "lead_followup")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Where(clause = "is_deleted = false")
public class LeadFollowup extends BaseEntity implements IAuditLog{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // lead id mapping

    @Enumerated(EnumType.STRING)
    private LeadFollowupStatuses status;

    private LocalDateTime followupAt;

    private Boolean isActive;

    private String followupBy;

    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="lead_id", nullable=false)
    private Lead lead;

    @Override
    public String toString() {
        return "LeadFollowup{" +
                "id=" + id +
                ", status=" + status +
                ", followupAt=" + followupAt +
                ", isActive=" + isActive +
                ", followupBy='" + followupBy + '\'' +
                ", remarks='" + remarks + '\'' +
                '}';
    }
}
