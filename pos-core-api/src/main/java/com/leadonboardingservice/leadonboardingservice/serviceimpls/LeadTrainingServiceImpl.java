package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.LeadTrigger;
import com.leadonboardingservice.leadonboardingservice.enums.TrainingStatuses;
import com.leadonboardingservice.leadonboardingservice.exceptions.ValidationException;
import com.leadonboardingservice.leadonboardingservice.helpers.NullAwareBeanUtilsBean;
import com.leadonboardingservice.leadonboardingservice.helpers.TransactionManagerImpl;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadTraining;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadTrainingRepository;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadTrainingService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;


@Slf4j
@AllArgsConstructor
@Service
public class LeadTrainingServiceImpl implements LeadTrainingService {

    private final LeadRepository leadRepository;
    private final LeadTrainingRepository leadTrainingRepository;
    private final LeadEventServiceImpl leadEventService;
    private final AsyncEsSyncService esSyncService;
    private final TransactionManagerImpl transactionManager;

    private Lead fetchLeadByUuid(String leadId) throws Exception{
        Optional<Lead> fetchedLead = leadRepository.findByUuid(leadId);
        if(fetchedLead.isEmpty()){
            throw new Exception("lead with given id not found");
        }
        return fetchedLead.get();
    }

    @Override
    public List<LeadTraining> createOrUpdateLeadTrainingStatus(String leadId, LeadTraining leadTraining) throws Exception {
        Lead lead = fetchLeadByUuid(leadId);
        List<LeadTraining> trainingList = lead.getLeadTrainings();
        leadTraining.setLead(lead);
        if(trainingList == null || trainingList.isEmpty()){
            trainingList = new ArrayList<>();
        }
        Optional<LeadTraining> existingLeadTraining = trainingList
                .stream()
                .filter(x->x.getProduct().equals(leadTraining.getProduct()))
                .findFirst();
        if(existingLeadTraining.isPresent()){
            NullAwareBeanUtilsBean.copyNonNullProperties(leadTraining,existingLeadTraining.get());
        } else {
            trainingList.add(leadTraining);
            leadEventService.triggerEvent(new LeadStatusEventRequestDto(leadId, LeadTrigger.VERIFY, new HashMap<>()));
        }
        leadTrainingRepository.saveAll(trainingList);
        if(trainingList.stream().anyMatch(x -> x.getStatus().equals(TrainingStatuses.COMPLETED))) {
            transactionManager.executeAfterTransactionCommits(() -> triggerTrainingCompletionEvent(leadId));
        }
        return trainingList;
    }

    private void triggerTrainingCompletionEvent(String leadId) {
        CompletableFuture.runAsync(() -> {
            try {
                leadEventService.triggerEvent(new LeadStatusEventRequestDto(leadId, LeadTrigger.TRAINING_COMPLETION, new HashMap<>()));
            } catch (ValidationException e) {
                log.warn("exception occurred while training completion {}",e.getMessage());
                e.printStackTrace();
            }
        });
    }

    @Override
    public void fetchRecords(String trainingMaterialDownloaded, Integer s) {
        List<LeadTraining> leadTrainingList = leadTrainingRepository.findByStatus(trainingMaterialDownloaded,s);
        if (leadTrainingList == null) {
            return;
        }
        log.info("count of leads to be sent test link {}",leadTrainingList.size());
        leadTrainingList.forEach(leadTraining -> {
            log.info("updating lead training status TEST_LINK_SHARED for lead {}",leadTraining.getLeadId());
            leadTraining.setStatus(TrainingStatuses.TEST_LINK_SHARED);
            leadTrainingRepository.save(leadTraining);
           //transactionManager.executeAfterTransactionCommits(()->esSyncService.upsertLeadAsync(leadTraining.getLeadId()));
        });
    }

    public List<LeadTraining> fetchTrainingStatusBeforeHours(String status, Integer hours) {
        return leadTrainingRepository.findByStatus(status,hours);
    }

    @Override
    public void updateLeadTrainingStatus(){
        try {
            List<LeadTraining> leadTrainingList = fetchTrainingStatusBeforeHours(String.valueOf(TrainingStatuses.TRAINING_MATERIAL_DOWNLOADED), 24);
            log.info("count of leads to be sent test link {}", leadTrainingList.size());
            if (leadTrainingList.isEmpty()) {
                return;
            }
            leadTrainingList.forEach(leadTraining -> {
                log.info("updating lead training status TEST_LINK_SHARED for lead {}", leadTraining.getLeadId());
                leadTraining.setStatus(TrainingStatuses.TEST_LINK_SHARED);
                leadTrainingRepository.save(leadTraining);
                esSyncService.upsertLeadAsync(leadTraining.getLeadId());
            });
        } catch (Exception e){
            log.error("exception occurred while updating lead training status {}",e.getMessage());
            e.printStackTrace();
        }
    }
}
