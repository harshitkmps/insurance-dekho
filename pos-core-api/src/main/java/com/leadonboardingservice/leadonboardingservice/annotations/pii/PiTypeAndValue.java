package com.leadonboardingservice.leadonboardingservice.annotations.pii;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class PiTypeAndValue {
    private String piType;

    private String value;
}
