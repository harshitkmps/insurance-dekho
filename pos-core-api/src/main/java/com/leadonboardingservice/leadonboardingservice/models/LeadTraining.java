package com.leadonboardingservice.leadonboardingservice.models;

import com.leadonboardingservice.leadonboardingservice.annotations.event.Event;
import com.leadonboardingservice.leadonboardingservice.annotations.event.EventType;
import com.leadonboardingservice.leadonboardingservice.annotations.event.Events;
import com.leadonboardingservice.leadonboardingservice.enums.InsuranceProduct;
import com.leadonboardingservice.leadonboardingservice.enums.TrainingStatuses;
import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.time.LocalDateTime;

@Table(name = "lead_training")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Where(clause = "is_deleted = false")
public class LeadTraining extends BaseEntity implements IAuditLog{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lead_id",insertable = false, updatable = false)
    private Long leadId;

    // lead id mapping
    @Enumerated(EnumType.STRING)
    private InsuranceProduct product;

    @Events(event = {
            @Event(name = "TRAINING_MATERIAL_SHARED", type = EventType.CREATE)
    }, prefixField = "product")
    @Enumerated(EnumType.STRING)
    private TrainingStatuses status;

    private LocalDateTime agreementAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="lead_id", nullable=false)
    private Lead lead;

    @Override
    public String toString() {
        return "LeadTraining{" +
                "id=" + id +
                ", leadId=" + leadId +
                ", product=" + product +
                ", status=" + status +
                ", agreementAt=" + agreementAt +
                '}';
    }
}
