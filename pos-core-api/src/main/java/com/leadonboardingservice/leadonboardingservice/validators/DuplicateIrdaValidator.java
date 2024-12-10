package com.leadonboardingservice.leadonboardingservice.validators;

import com.leadonboardingservice.leadonboardingservice.exceptions.InvalidRequestException;
import com.leadonboardingservice.leadonboardingservice.models.User;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.UserRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DuplicateIrdaValidator {

    private final UserRepository userRepository;
    private final LeadRepository leadRepository;

    public void validate(@NonNull String leadUuid, String irdaId, LocalDate irdaReportingDate) throws Exception {
        if (StringUtils.isEmpty(irdaId)) {
            return;
        }
        if (irdaReportingDate == null) {
            throw new InvalidRequestException("irda reporting date required when updating irda id");
        }
        boolean isDuplicateLead = leadRepository.findByIrdaId(irdaId).stream()
                .anyMatch(lead -> !leadUuid.equals(lead.getUuid()));
        if (isDuplicateLead) {
            throw new InvalidRequestException("Lead with IRDA ID already exists");
        }
        List<User> userList = userRepository.findByIrdaId(irdaId);
        if (!userList.isEmpty()) {
            throw new InvalidRequestException("user with given irda already exist. " + irdaId);
        }
    }
}
