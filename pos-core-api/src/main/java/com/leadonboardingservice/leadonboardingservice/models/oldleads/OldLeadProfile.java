package com.leadonboardingservice.leadonboardingservice.models.oldleads;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity(name = "tbl_lead_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OldLeadProfile {
    @Id
    private Long id;
    private String uuid;
    private String leadToken;
    private String isExperienced;
    private Integer educationCertificate;
    private String politicallyExposedConsent;

}
