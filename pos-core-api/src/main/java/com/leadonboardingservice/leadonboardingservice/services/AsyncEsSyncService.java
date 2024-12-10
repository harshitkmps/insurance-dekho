package com.leadonboardingservice.leadonboardingservice.services;

public interface AsyncEsSyncService {
    void upsertLeadAsync(Long id);
    void upsertLeadIrdaiEventAsync(Long id);
    void upsertPosUserCreationAsync(String gcdCode);
}
