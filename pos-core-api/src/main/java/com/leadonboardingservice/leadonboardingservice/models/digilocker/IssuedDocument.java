package com.leadonboardingservice.leadonboardingservice.models.digilocker;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class IssuedDocument {
    private String name;

    private String uri;

    private String doctype;

    private String description;

    public String getName() {
        return name;
    }

    public String getUri() {
        return uri;
    }

    public String getDoctype() {
        return doctype;
    }

    public String getDescription() {
        return description;
    }
}
