package com.leadonboardingservice.leadonboardingservice.models;

import com.leadonboardingservice.leadonboardingservice.annotations.pii.Pii;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.PiiType;
import com.leadonboardingservice.leadonboardingservice.enums.AddressTypes;
import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;

@Table(name ="lead_address")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Where(clause = "is_deleted = false")
public class Address extends BaseEntity  implements IAuditLog{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // leadID mapping
    @Enumerated(EnumType.STRING)
    private AddressTypes type;

    private String pincode;

    @Pii(field = "address", type = PiiType.DECRYPTED, transform = true)
    private String address;

    @Pii(field = "address_encrypted", type = PiiType.ENCRYPTED, decryptField = "address")
    private String addressEncrypted;

    @Pii(field = "address_masked", type = PiiType.MASKED)
    private String addressMasked;

    private String locality;

    //private String fullAddress;

    private Integer cityId;

    private Integer stateId;

    private String gstNumber;

    //private Object meta;

    @ManyToOne(fetch = FetchType.LAZY)
    private Lead lead;

    @Override
    public String toString() {
        return "Address{" +
                "id=" + id +
                ", type=" + type +
                ", pincode='" + pincode + '\'' +
                //", address='" + address + '\'' +
                ", addressEncrypted='" + addressEncrypted + '\'' +
                ", addressMasked='" + addressMasked + '\'' +
                ", locality='" + locality + '\'' +
                ", cityId=" + cityId +
                ", stateId=" + stateId +
                ", lead=" + lead +
                '}';
    }
}
