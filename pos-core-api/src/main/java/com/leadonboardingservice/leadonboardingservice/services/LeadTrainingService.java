package com.leadonboardingservice.leadonboardingservice.services;

import com.leadonboardingservice.leadonboardingservice.enums.TrainingStatuses;
import com.leadonboardingservice.leadonboardingservice.models.LeadTraining;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface LeadTrainingService {
    List<LeadTraining> createOrUpdateLeadTrainingStatus(String leadId, LeadTraining leadTrainingStatusDto) throws Exception;

    void fetchRecords(String trainingMaterialDownloaded, Integer s);

    void updateLeadTrainingStatus();
}
