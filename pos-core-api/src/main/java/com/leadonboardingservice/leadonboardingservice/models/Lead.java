package com.leadonboardingservice.leadonboardingservice.models;

import com.leadonboardingservice.leadonboardingservice.annotations.event.Event;
import com.leadonboardingservice.leadonboardingservice.annotations.event.EventType;
import com.leadonboardingservice.leadonboardingservice.annotations.event.Events;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.Pii;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.PiiType;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.enums.LeadOriginChannels;
import com.leadonboardingservice.leadonboardingservice.enums.LeadOriginMethods;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;



@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="leads")
@Getter
@Setter
@Builder
@Where(clause = "is_deleted = false")
public class Lead extends BaseEntity  implements IAuditLog{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long oldLeadId;

    private String uuid;

    @Pii(field = "mobile_hashed", type = PiiType.HASHED)
    private String mobileHashed;

    @Pii(field = "mobile_masked", type = PiiType.MASKED)
    private String mobileMasked;

    @Pii(field = "mobile_encrypted", type = PiiType.ENCRYPTED, decryptField = "mobile")
    private String mobileEncrypted;

    @Transient
    @Pii(field = "mobile", type = PiiType.DECRYPTED, transform = true)
    private String mobileDecrypted;

    @Pii(field = "email_hashed", type = PiiType.HASHED)
    private String emailHashed;

    @Pii(field = "email_masked", type = PiiType.MASKED)
    private String emailMasked;

    @Pii(field = "email_encrypted", type = PiiType.ENCRYPTED, decryptField = "email")
    private String emailEncrypted;

    @Transient
    @Pii(field = "email", type = PiiType.DECRYPTED, transform = true)
    private String emailDecrypted;

    @Events(event = {
            @Event(name = "CREATED", type = EventType.CREATE),
    })
    @Enumerated(EnumType.STRING)
    private LeadStatus status;

    private String name;

    private Integer cityId;

    private Integer tenantId;

//    private LeadSource leadSource;

    private String referrerIamUuid;

    @Events(defaultName = LeadConstants.LEAD_ASSIGNMENT_EVENT,event = {
    })
    private String assignedSalesIamUuid;

    @Enumerated(EnumType.STRING)
    private LeadOriginChannels leadOrigin;

    @Enumerated(EnumType.STRING)
    private LeadOriginMethods leadOriginatedBy;

    private Integer closedStatusRemarkId;

    private String rejectionReason;

    private String irdaId;

    private LocalDate irdaReportingDate;

    private String channelPartnerId;

    private String rejectionRemarksId;

    @OneToOne(mappedBy = "lead", cascade = CascadeType.MERGE)
    @PrimaryKeyJoinColumn
    private LeadProfile leadProfile;

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL)
    private List<Address> address;

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL)
    private List<BankDetail> bankDetails;

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL)
    private List<Document> documents;

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL)
    private List<LeadFollowup> leadFollowups;

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL)
    private List<LeadTraining> leadTrainings;

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL)
    private List<LeadEvents> leadEvents;

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL)
    private Set<LeadAdditionalDetails> leadAdditionalDetails;

    @Override
    public String toString() {
        return "Lead{" +
                "id=" + id +
                ", uuid='" + uuid + '\'' +
                ", mobileHashed='" + mobileHashed + '\'' +
                ", mobileMasked='" + mobileMasked + '\'' +
                ", mobileEncrypted='" + mobileEncrypted + '\'' +
                //", mobileDecrypted='" + mobileDecrypted + '\'' +
                ", emailHashed='" + emailHashed + '\'' +
                ", emailMasked='" + emailMasked + '\'' +
                ", emailEncrypted='" + emailEncrypted + '\'' +
                //", emailDecrypted='" + emailDecrypted + '\'' +
                ", status=" + status +
                ", name='" + name + '\'' +
                ", cityId=" + cityId +
                ", tenantId=" + tenantId +
                ", referrerUserId='" + referrerIamUuid + '\'' +
                ", assignedSalesUserId='" + assignedSalesIamUuid + '\'' +
                ", leadOrigin=" + leadOrigin +
                ", leadOriginatedBy=" + leadOriginatedBy +
                ", closedStatusRemarkId=" + closedStatusRemarkId +
                ", rejectionReason='" + rejectionReason + '\'' +
                ", irdaId='" + irdaId + '\'' +
                ", irdaReportingDate=" + irdaReportingDate +
                ", channelPartnerId='" + channelPartnerId + '\'' +
                ", rejectionRemarksId='" + rejectionRemarksId + '\'' +
                '}';
    }


    public Long fetchId(){
        if(this.getOldLeadId() != null){
            return this.getOldLeadId();
        }
        return this.getId();
    }
}
