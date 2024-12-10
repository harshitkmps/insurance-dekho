package com.leadonboardingservice.leadonboardingservice.validators;

import com.leadonboardingservice.leadonboardingservice.exceptions.InvalidRequestException;
import com.leadonboardingservice.leadonboardingservice.externals.ApiPosApiHelper;
import com.leadonboardingservice.leadonboardingservice.helpers.HashGenerator;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DuplicateEmailValidator {

    private final HashGenerator hashGenerator;
    private final LeadRepository leadRepository;
    private final ApiPosApiHelper apiPosApiHelper;

    public void validate(@NonNull String leadUuid, String email) throws Exception {
        if (StringUtils.isEmpty(email)) {
            return;
        }
        String emailHashed = hashGenerator.generate(email);
        Optional<Lead> duplicateLead = leadRepository.findByEmailHashed(emailHashed).stream()
                .filter(lead -> !leadUuid.equals(lead.getUuid()))
                .findFirst();

        if (duplicateLead.isPresent()) {
            Long displayLeadId = duplicateLead.get().getId();
            if (duplicateLead.get().getOldLeadId() != null) {
                displayLeadId = duplicateLead.get().getOldLeadId();
            }
            throw new InvalidRequestException("Lead with email already exists. LeadId: " + displayLeadId);
        }
        if (apiPosApiHelper.checkIfUserExistByEmail(email)) {
            throw new InvalidRequestException("user with given email already exist. " + email);
        }
    }

}
