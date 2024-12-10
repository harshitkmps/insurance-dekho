package com.leadonboardingservice.leadonboardingservice.models;

import com.leadonboardingservice.leadonboardingservice.annotations.pii.Pii;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.PiiType;
import com.leadonboardingservice.leadonboardingservice.enums.VisitorStatus;
import lombok.*;

import javax.persistence.*;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "visitors")
@Getter
@Setter
@Builder
public class Visitor extends BaseEntity{
    @Id
    private String id;

    private String uuid;

    private String name;

    @Pii(field = "email_encrypted", type = PiiType.ENCRYPTED, decryptField = "email")
    private String emailEncrypted;

    @Pii(field = "email_masked", type = PiiType.MASKED)
    private String emailMasked;

    @Pii(field = "email_hashed", type = PiiType.HASHED)
    private String emailHashed;

    @Transient
    @Pii(field = "email", type = PiiType.DECRYPTED, transform = true)
    private String emailDecrypted;

    @Pii(field = "mobile_encrypted", type = PiiType.ENCRYPTED, decryptField = "mobile")
    private String mobileEncrypted;

    @Pii(field = "mobile_masked", type = PiiType.MASKED)
    private String mobileMasked;

    @Pii(field = "mobile_hashed", type = PiiType.HASHED)
    private String mobileHashed;

    @Transient
    @Pii(field = "mobile", type = PiiType.DECRYPTED, transform = true)
    private String mobileDecrypted;

    @Enumerated(EnumType.STRING)
    private VisitorStatus status;

    private String assignedSalesIamUuid;

    public String getId() {
        return id;
    }

}

