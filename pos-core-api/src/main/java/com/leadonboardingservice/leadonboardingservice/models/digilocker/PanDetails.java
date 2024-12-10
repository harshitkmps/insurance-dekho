package com.leadonboardingservice.leadonboardingservice.models.digilocker;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@XmlRootElement(name = "Certificate")
@XmlAccessorType(XmlAccessType.FIELD)
public class PanDetails {

    @XmlAttribute
    private String number;

    private IssuedTo IssuedTo;

}
