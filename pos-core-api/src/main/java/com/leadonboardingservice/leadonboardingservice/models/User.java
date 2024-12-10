package com.leadonboardingservice.leadonboardingservice.models;

import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="tbl_user")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@Where(clause = "is_active = '1'")
public class User {
    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long leadId;
    private String uuid;
    private int isQcBypass;
    private Long parentUserId;
    private Integer roleId;
    private Integer communicationStatus;
    private Integer businessUnitId;
    private Long dealerId;
    private String dealerOrganization;
    private Integer dealerCityId;
    private String dealerCityName;
    private String userName;
    private String password;
    private String itmsPassword;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private LocalDate irdaReportingDate;
    private String irdaId;
    private Integer status;
    private String isActive;
    private LocalDateTime added;
    private LocalDateTime modified;
    private LocalDateTime syncDate;
    private String referDealerId;
    private String address;
    private Integer cityId;
    private Integer stateId;
    private String locality;
    private String stateName;
    private String cityName;
    private Integer irdaStatus;
    private Integer posId;
    private String gcdCode;
    private String source;
    private Integer posStatus;
    private String channel_partner_id;
    private Boolean onboardedOnGeneral;
    private Boolean onboardedOnLife;
    private Boolean eligibleForGeneral;
    private Boolean eligibleForLife;
    private Integer pincode;
    private Integer tenantId;
    private Integer reasonOfInactivation;
}
