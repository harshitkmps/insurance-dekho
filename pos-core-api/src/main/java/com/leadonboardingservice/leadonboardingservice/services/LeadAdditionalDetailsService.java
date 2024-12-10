package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.models.LeadAdditionalDetails;

import javax.validation.constraints.NotNull;
import java.util.List;

public interface LeadAdditionalDetailsService {
    List<LeadAdditionalDetails> addDetails(@NotNull String leadId, List<LeadAdditionalDetails> leadAdditionalDetails);

    List<LeadAdditionalDetails> findDetails(@NotNull String leadId, List<LeadAdditionalDetails> leadAdditionalDetails);
}
