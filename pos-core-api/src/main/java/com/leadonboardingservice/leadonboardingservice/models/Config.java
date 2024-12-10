package com.leadonboardingservice.leadonboardingservice.models;
import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name="tbl_config")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Where(clause = "status = '1'")
public class Config {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String configName;
    private String dataType;
    private String configValues;
    private boolean status;
    private LocalDateTime added;
    private LocalDateTime modified;
    private boolean updatedBy;
}
