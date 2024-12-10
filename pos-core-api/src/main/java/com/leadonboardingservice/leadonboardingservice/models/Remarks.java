package com.leadonboardingservice.leadonboardingservice.models;

import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;

@Table(name = "remarks")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Where(clause = "is_deleted = false")
public class Remarks extends BaseEntity implements IAuditLog{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;

    private String text;

    @Override
    public String toString() {
        return "Remarks{" +
                "id=" + id +
                ", category='" + category + '\'' +
                ", text='" + text + '\'' +
                '}';
    }
}
