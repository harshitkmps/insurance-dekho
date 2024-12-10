package com.leadonboardingservice.leadonboardingservice.validators;

import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.exceptions.InvalidRequestException;
import com.leadonboardingservice.leadonboardingservice.helpers.HashGenerator;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
@RequiredArgsConstructor
@Slf4j
public class DuplicateLeadValidator implements CreateLeadValidator{
    private final HashGenerator hashGenerator;
    private final LeadRepository leadRepository;
    @Override
    public Optional<String> validate(CreateLeadRequestDto createLeadDto) {
        String mobileHashed = hashGenerator.generate(createLeadDto.getMobile());
        if(StringUtils.isEmpty(createLeadDto.getEmail())) {
            return checkForDuplicateLead(createLeadDto.getUuid(),mobileHashed, null);
        }
        String emailHashed = hashGenerator.generate(createLeadDto.getEmail());
        return checkForDuplicateLead(createLeadDto.getUuid(), mobileHashed, emailHashed);
    }

    public void validate(Lead existingLead) throws Exception{
        log.info("checking for duplicate lead {}",existingLead);
        Optional<Lead> duplicateLead = leadRepository.findByMobileHashedOrEmailHashedOrUuid(
                        existingLead.getMobileHashed(),
                        existingLead.getEmailHashed(),
                        existingLead.getUuid()
                )
                .stream()
                .filter(lead -> !lead.getUuid().equals(existingLead.getUuid()))
                .findFirst();
        if (duplicateLead.isPresent()) {
            Long displayLeadId = duplicateLead.get().getId();
            if (duplicateLead.get().getOldLeadId() != null) {
                displayLeadId = duplicateLead.get().getOldLeadId();
            }
            throw new RuntimeException("Lead already exists with email/mobile. LeadId: " + displayLeadId);
        }
    }


    private Optional<String> checkForDuplicateLead(String uuid, String mobileHashed, String emailHashed) {
        log.info("checking for duplicate lead uuid {}, mobileHashed {}, emailHashed {}",uuid,mobileHashed,emailHashed);
        List<Lead> existingLeadList;
        if(StringUtils.isEmpty(emailHashed)) {
            existingLeadList = leadRepository.findByMobileHashedOrUuid(mobileHashed, uuid);
        }else {
            existingLeadList = leadRepository.findByMobileHashedOrEmailHashedOrUuid(mobileHashed, emailHashed, uuid);
        }
        if(!existingLeadList.isEmpty()){
            log.info("lead already exist ");
            StringBuilder message = new StringBuilder();
            existingLeadList.forEach(lead -> {
                if(lead.getMobileHashed().equals(mobileHashed) &&
                        lead.getEmailHashed()!=null &&  lead.getEmailHashed().equals(emailHashed)) {
                    message.append("lead already exists with given mobile/email");
                } else {
                    if (lead.getMobileHashed().equals(mobileHashed)) {
                        message.append("lead already exists with given mobile.");
                    } else if (lead.getEmailHashed()!=null && lead.getEmailHashed().equals(emailHashed)) {
                        message.append("lead already exists with given email.");
                    } else if(lead.getUuid().equals(uuid)){
                        message.append("lead already exists with same uuid.");
                    }
                }
            });
            return Optional.of(message.toString());
        }
        return Optional.empty();
    }

}
