package com.leadonboardingservice.leadonboardingservice.validators;

import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateVisitorRequestDto;
import com.leadonboardingservice.leadonboardingservice.helpers.HashGenerator;
import com.leadonboardingservice.leadonboardingservice.models.Visitor;
import com.leadonboardingservice.leadonboardingservice.repositories.VisitorRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Slf4j
public class DuplicateVisitorValidator {
    private final VisitorRepository visitorRepository;
    private final HashGenerator hashGenerator;

    public Optional<String> validate(String mobile) {
        String mobileHashed = hashGenerator.generate(mobile);
        List<Visitor> visitorsByMobile = visitorRepository.findByMobileHashed(mobileHashed);
        if (!visitorsByMobile.isEmpty()) {
            return Optional.of("visitor already exist with mobile: "+mobile+", id: "+visitorsByMobile.get(0).getId());
        }
        return Optional.empty();
    }
}
