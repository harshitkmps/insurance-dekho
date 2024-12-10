package com.leadonboardingservice.leadonboardingservice.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Where;

import javax.persistence.*;

@AllArgsConstructor
@Entity
@Data
@NoArgsConstructor
@Table(name="lead_additional_detail")
@Builder
@Where(clause = "is_deleted = false")
public class LeadAdditionalDetails extends BaseEntity implements IAuditLog{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String propertyName;
    private String propertyValue;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="lead_id")
    private Lead lead;

    public LeadAdditionalDetails(String propertyName, String propertyValue) {
        this.propertyName = propertyName;
        this.propertyValue = propertyValue;
    }

    @Override
    public String toString() {
        return "LeadAdditionalDetails{" +
                "id=" + id +
                ", propertyName='" + propertyName + '\'' +
                ", propertyValue='" + propertyValue + '\'' +
                '}';
    }
}
