package com.leadonboardingservice.leadonboardingservice.models.oldleads;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity(name = "agent_reg_tbl")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OldLeadTraining {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "insurance_type")
    private Integer insuranceType;

    @Column(name = "lead_token")
    private String leadToken;

    @Column(name = "exam_status")
    private Integer examStatus;


}

