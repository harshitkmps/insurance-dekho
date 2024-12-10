package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.dtos.request.SyncLeadRequestDto;

import java.util.List;

public interface EsSyncService {
    List<Long> upsertLeads(SyncLeadRequestDto syncLeadDto) throws Exception;
}
