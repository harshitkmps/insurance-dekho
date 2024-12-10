package com.leadonboardingservice.leadonboardingservice.models;

import com.leadonboardingservice.leadonboardingservice.annotations.pii.Pii;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.PiiType;
import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;


@Table(name = "lead_bank_detail")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Where(clause = "is_deleted = false")
public class BankDetail extends BaseEntity  implements IAuditLog{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // lead id mapping
    private Boolean isActive;

    private Boolean isBankVerified;

    private String beneficiaryName;

    @Pii(field = "account_number_masked", type = PiiType.MASKED)
    private String accountNumberMasked;

    @Pii(field = "account_number_hashed", type = PiiType.HASHED)
    private String accountNumberHashed;

    @Pii(field = "account_number_encrypted", type = PiiType.ENCRYPTED, decryptField = "account_number")
    private String accountNumberEncrypted;

    @Transient
    @Pii(field = "account_number", type = PiiType.DECRYPTED, transform = true)
    private String accountNumberDecrypted;

    @Column(name = "ifsc_encrypted")
    private String ifsc;

    private String bankName;

    private String bankBranchName;

    private String beneficiaryId;

    private Boolean isJointAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="lead_id", nullable=false)
    private Lead lead;

    // bank doc ref


    @Override
    public String toString() {
        return "BankDetail{" +
                "id=" + id +
                ", isActive=" + isActive +
                ", isBankVerified=" + isBankVerified +
                ", beneficiaryName='" + beneficiaryName + '\'' +
                ", accountNumberMasked='" + accountNumberMasked + '\'' +
                ", accountNumberHashed='" + accountNumberHashed + '\'' +
                ", accountNumberEncrypted='" + accountNumberEncrypted + '\'' +
                //", accountNumberDecrypted='" + accountNumberDecrypted + '\'' +
                ", beneficiaryId='" + beneficiaryId + '\'' +
                ", ifsc='" + ifsc + '\'' +
                ", bankName='" + bankName + '\'' +
                ", bankBranchName='" + bankBranchName + '\'' +
                ", isJointAccount=" + isJointAccount +
                '}';
    }

    public void clearBankDetails() {
        this.setAccountNumberDecrypted(null);
        this.setAccountNumberHashed(null);
        this.setIsDeleted(true);
    }
}
