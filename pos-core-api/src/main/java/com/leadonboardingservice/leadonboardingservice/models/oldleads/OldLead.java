package com.leadonboardingservice.leadonboardingservice.models.oldleads;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "tbl_lead")
public class OldLead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uuid;

    @Column(name = "lead_token")
    private String leadToken;

    private String name;

    private String mobile;

    private String email;

    private Integer status;

    @Column(name = "irda_id")
    private String irdaId;

    @Column(name = "irda_reporting_date")
    private Date irdaReportingDate;

    @Column(name = "is_whatsapp_consent")
    private Boolean isWhatsappConsent;

    private String address;

    private String locality;

    @Column(name = "city_id")
    private Integer cityId;

    @Column(name = "state_id")
    private Integer stateId;

    @Column(name = "pin_code")
    private String pincode;

    @Column(name = "same_shop_address")
    private String sameShopAddress;

    @Column(name = "shop_address")
    private String shopAddress;

    @Column(name = "shop_locality")
    private String shopLocality;

    @Column(name = "shop_city_id")
    private Integer shopCityId;

    @Column(name = "shop_state_id")
    private Integer shopStateId;

    @Column(name = "shop_pin_code")
    private String shopPincode;

    @Column(name = "same_work_address")
    private String sameWorkAddress;

    @Column(name = "work_address")
    private String workAddress;

    @Column(name = "work_locality")
    private String workLocality;

    @Column(name = "work_city_id")
    private Integer workCityId;

    @Column(name = "work_state_id")
    private Integer workStateId;

    @Column(name = "work_pin_code")
    private String workPincode;

    @Column(name = "benificiary_name")
    private String beneficiaryName;

    @Column(name = "beneficiary_id")
    private String beneficiaryId;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name= "penny_drop_flag")
    private Integer pennyDropFlag;

    @Column(name = "verified_account_number")
    private String verifiedAccountNumber;

    @Column(name = "ifsc_code")
    private String ifscCode;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "branch_name")
    private String bankBranchName;

    private String pan;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "follow_up_text")
    private String followUpText;

    @Column(name = "follow_up_time")
    private String followUpTime;

    @Column(name = "lead_origin")
    private String leadOrigin;

    @Column(name = "refer_dealer_id")
    private String referrerUserId;

    @Column(name = "utm_source")
    private String utmSource;

    @Column(name = "user_assign_id")
    private String assignedSalesUserId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "tenant_id")
    private Integer tenantId;

    @Transient
    private List<OldLeadDoc> leadDoc;
    @Transient
    private List<OldLeadTraining> oldLeadTraining;
    @Transient
    private OldLeadProfile oldLeadProfile;

    private Integer isMigrate;

    @Column(name = "reg_remarks")
    private String regRemarks;

}
