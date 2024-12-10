package com.leadonboardingservice.leadonboardingservice.validators;

import com.leadonboardingservice.leadonboardingservice.exceptions.ValidationException;
import com.leadonboardingservice.leadonboardingservice.helpers.HashGenerator;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadProfile;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadProfileRepository;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class LeadOnboardValidator {

    private final HashGenerator hashGenerator;

    private final LeadRepository leadRepository;

    private final LeadProfileRepository leadProfileRepository;

    public void ifMobileOrEmailExist(String mobile, String email) throws ValidationException{
        // check if any user exist with given mobile or email


        // generate hash then
//        String mobileHash = hashGenerator.generate(mobile);
//        String emailHash = hashGenerator.generate(email);
//
//        // check if any leadExist with given mobile or email
//        List<Lead> existingLeads = leadRepository.findByMobileHashedOrEmailHashed(mobileHash, emailHash);
//        if(existingLeads.size() > 0){
//            throw new ValidationException("A lead already exist with same email/phone");
//        }
    }

    public void ifPanAlreadyExist(String pan) throws ValidationException{
        // check if any user has given pan


        // generate pan hash then
//        String panHash = hashGenerator.generate(pan);
//
//        // check if any lead has given pan
//        List<LeadProfile> leadProfileList = leadProfileRepository.findByPanHashed(panHash);
//        if(leadProfileList.size() > 0){
//            throw new ValidationException("Given pan already exist with another lead");
//        }
    }
}
