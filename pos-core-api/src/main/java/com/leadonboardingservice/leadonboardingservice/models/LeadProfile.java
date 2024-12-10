package com.leadonboardingservice.leadonboardingservice.models;

import com.leadonboardingservice.leadonboardingservice.annotations.pii.Pii;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.PiiType;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "lead_profile")
public class LeadProfile extends BaseEntity implements IAuditLog{

    @Id
    @Column(name = "lead_id")
    //@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Pii(field = "pan_masked", type = PiiType.MASKED)
    private String panMasked;

    @Pii(field = "pan_encrypted", type = PiiType.ENCRYPTED, decryptField = "pan")
    private String panEncrypted;

    @Pii(field = "pan_hashed", type = PiiType.HASHED)
    private String panHashed;

    @Transient
    @Pii(field = "pan", type = PiiType.DECRYPTED, transform = true)
    private String panDecrypted;

    @Column(columnDefinition = "boolean default false")
    private Boolean isPanVerified;

    /*@Column("aadhaar_masked")
    private String aadhaarMasked;

    @Column("aadhaar_encrypted")
    private String aadhaarEncrypted;

    @Column("aadhaar_hashed")
    private String aadhaarHashed;

    @Column("is_aadhaar_verified")
    private Boolean isAadhaarVerified;*/

    private String educationDetails;

    private LocalDate dateOfBirth;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    private Lead lead;

    @Override
    public String toString() {
        return "LeadProfile{" +
                "id=" + id +
                ", panMasked='" + panMasked + '\'' +
                ", panEncrypted='" + panEncrypted + '\'' +
                ", panHashed='" + panHashed + '\'' +
                //", panDecrypted='" + panDecrypted + '\'' +
                ", isPanVerified=" + isPanVerified +
                ", educationDetails='" + educationDetails + '\'' +
                ", dateOfBirth=" + dateOfBirth +
                '}';
    }

    public void clearPan() {
        this.setIsPanVerified(false);
        this.setPanDecrypted(null);
        this.setPanEncrypted(null);
        this.setPanHashed(null);
        this.setPanMasked(null);
    }
}
