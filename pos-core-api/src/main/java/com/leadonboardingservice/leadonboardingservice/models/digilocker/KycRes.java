package com.leadonboardingservice.leadonboardingservice.models.digilocker;

import lombok.*;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;

@Getter
@Setter
@XmlAccessorType(XmlAccessType.FIELD)
public class KycRes {
    private com.leadonboardingservice.leadonboardingservice.models.digilocker.UidData UidData;
    @XmlAttribute
    private String ret;

}