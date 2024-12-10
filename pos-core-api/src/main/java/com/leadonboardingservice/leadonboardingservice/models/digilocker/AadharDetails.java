package com.leadonboardingservice.leadonboardingservice.models.digilocker;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@XmlRootElement(name = "Certificate")
@XmlAccessorType(XmlAccessType.FIELD)
public class AadharDetails {

    private CertificateData CertificateData;

    public UidData getDetails(){
        return this.getCertificateData().getKycRes().getUidData();
    }
}

