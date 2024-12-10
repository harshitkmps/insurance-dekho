package com.leadonboardingservice.leadonboardingservice.annotations.pii;

public enum PiiType {
    MASKED("masked"),ENCRYPTED("encrypted"),HASHED("hashed"),DECRYPTED("decrypted");

    private final String piiType;

    PiiType(String type) {
        this.piiType=type;
    }

    public String getPiiType() {
        return piiType;
    }
}
