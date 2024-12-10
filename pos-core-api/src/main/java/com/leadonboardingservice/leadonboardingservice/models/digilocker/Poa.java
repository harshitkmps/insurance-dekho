package com.leadonboardingservice.leadonboardingservice.models.digilocker;

import lombok.*;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@XmlAccessorType(XmlAccessType.FIELD)
public class Poa {
    @XmlAttribute
    private String country;
    @XmlAttribute
    private String dist;
    @XmlAttribute
    private String house;
    @XmlAttribute
    private Long pc;
    @XmlAttribute
    private String state;
    @XmlAttribute
    private String street;
    @XmlAttribute
    private String vtc;

    public String getAddress(){
        return Stream.of(this.getHouse(), this.getStreet(), this.getDist(), this.getState())
                .filter(s -> s != null && !s.isEmpty())
                .collect(Collectors.joining(","));
    }
}