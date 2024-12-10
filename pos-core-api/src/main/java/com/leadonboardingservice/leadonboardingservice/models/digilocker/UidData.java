package com.leadonboardingservice.leadonboardingservice.models.digilocker;

import lombok.*;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@XmlAccessorType(XmlAccessType.FIELD)
public class UidData {

    private Poi Poi;
    private Poa Poa;
    private String Pht;

}