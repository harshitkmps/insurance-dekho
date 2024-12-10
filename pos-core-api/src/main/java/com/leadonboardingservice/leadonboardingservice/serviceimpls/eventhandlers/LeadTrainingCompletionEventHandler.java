package com.leadonboardingservice.leadonboardingservice.serviceimpls.eventhandlers;

import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadStatusEventRequestDto;
import com.leadonboardingservice.leadonboardingservice.enums.InsuranceProduct;
import com.leadonboardingservice.leadonboardingservice.enums.LeadTrigger;
import com.leadonboardingservice.leadonboardingservice.enums.TrainingStatuses;
import com.leadonboardingservice.leadonboardingservice.exceptions.ValidationException;
import com.leadonboardingservice.leadonboardingservice.externals.ChannelPartnerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.externals.requestdtos.UpdateChannelPartnerRequestDto;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadTraining;
import com.leadonboardingservice.leadonboardingservice.models.User;
import com.leadonboardingservice.leadonboardingservice.services.LeadService;
import com.leadonboardingservice.leadonboardingservice.services.PosUserService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class LeadTrainingCompletionEventHandler implements LeadEventHandler{
    private final LeadService leadService;
    private final PosUserService posUserService;
    private final ChannelPartnerServiceApiHelper channelPartnerServiceApiHelper;
    @SneakyThrows
    @Override
    public void handle(LeadStatusEventRequestDto leadRequest) throws ValidationException {
        log.info("inside lead leadTrainingCompletion for leadId {}",leadRequest.getLeadId());
        Lead lead = leadService.fetchLeadByUuid(leadRequest.getLeadId());
        if(lead.getLeadTrainings() == null || lead.getLeadTrainings().isEmpty()) {
            throw new RuntimeException("training not initiated for lead");
        }
        List<LeadTraining> leadTrainingList = lead.getLeadTrainings();
        Optional<User> optionalUser = posUserService.getUserByUUID(lead.getUuid());
        if(optionalUser.isEmpty()){
            throw new RuntimeException("lead not converted to agent");
        }
        List<LeadTraining> completedTrainings = leadTrainingList.stream().filter(x -> x.getStatus().equals(TrainingStatuses.COMPLETED)).collect(Collectors.toList());
        if(completedTrainings.isEmpty()){
            throw new RuntimeException("no exam found which is completed");
        }
        for (LeadTraining training: completedTrainings) {
            User user = optionalUser.get();
            if(training.getProduct().equals(InsuranceProduct.GENERAL)){
                if(user.getOnboardedOnGeneral() == null || !user.getOnboardedOnGeneral()){
                    log.info("setting onboarded on general true for lead {}",lead.getUuid());
                    user.setOnboardedOnGeneral(true);
                    UpdateChannelPartnerRequestDto channelPartnerRequestDto = UpdateChannelPartnerRequestDto
                            .builder()
                            .channelPartnerId(lead.getChannelPartnerId())
                            .onBoardedOnGeneral(true)
                            .generalOnboardingDate(training.getUpdatedAt().toString())
                            .build();
                    ChannelPartnerDto channelPartnerDto = channelPartnerServiceApiHelper.updateChannelPartner(channelPartnerRequestDto);
                    posUserService.save(user);
                }
            }
            if(training.getProduct().equals(InsuranceProduct.LIFE)){
                if((!StringUtils.isEmpty(user.getIrdaId())) && (user.getOnboardedOnLife() == null || !user.getOnboardedOnLife())){
                    log.info("setting onboarded on life true for lead {}",lead.getUuid());
                    user.setOnboardedOnLife(true);
                    UpdateChannelPartnerRequestDto channelPartnerRequestDto = UpdateChannelPartnerRequestDto
                            .builder()
                            .channelPartnerId(lead.getChannelPartnerId())
                            .onBoardedOnLife(true)
                            .lifeOnboardingDate(training.getUpdatedAt().toString())
                            .build();
                    ChannelPartnerDto channelPartnerDto = channelPartnerServiceApiHelper.updateChannelPartner(channelPartnerRequestDto);
                    posUserService.save(user);
                }
            }
        }
    }

    @Override
    public LeadTrigger getName() {
        return LeadTrigger.TRAINING_COMPLETION;
    }
}
