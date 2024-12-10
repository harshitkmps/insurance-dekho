package com.leadonboardingservice.leadonboardingservice.cron;

import com.leadonboardingservice.leadonboardingservice.services.LeadManager;
import com.leadonboardingservice.leadonboardingservice.services.LeadTrainingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class OnboardingTaskScheduler {

    //private final LeadManager leadManager;
    private final LeadTrainingService leadTrainingService;
    @Scheduled(cron = "0 0/30 6,10,15,20 * * *")
    @SchedulerLock(name = "TaskScheduler_shareTestLink")
    public void scheduledTask() {
        log.info("inside shareTestLinkScheduler");
        //leadManager.updateTrainingStatus();
        leadTrainingService.updateLeadTrainingStatus();
    }
}
