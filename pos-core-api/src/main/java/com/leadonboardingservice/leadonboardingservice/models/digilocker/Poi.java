package com.leadonboardingservice.leadonboardingservice.models.digilocker;

import lombok.*;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@XmlAccessorType(XmlAccessType.FIELD)
public class Poi {
    @XmlAttribute
    private String dob;
    @XmlAttribute
    private String gender;
    @XmlAttribute
    private String name;
}