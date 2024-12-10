package com.leadonboardingservice.leadonboardingservice.validators;

import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.externals.ApiPosApiHelper;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DuplicateUserValidator implements ConvertLeadValidator, CreateLeadValidator, ReopenLeadValidator {

    private final ApiPosApiHelper apiPosApiHelper;

    @Override
    public Optional<String> validate(Lead lead) {
        String mobile = lead.getMobileDecrypted();
        String email = lead.getEmailDecrypted();
        String iamUUID = lead.getUuid();
        return checkForDuplicateUser(iamUUID, mobile, email);
    }

    private Optional<String> checkForDuplicateUser(String iamUUID, String mobile, String email) {
        log.info("checking for duplicate user uuid {}, mobile {}, email {}", iamUUID, mobile, email);
        StringBuilder message = new StringBuilder();
        Boolean iamUuidUserExist = apiPosApiHelper.checkIfUserExistByUuid(iamUUID);
        Boolean mobileUserExist = apiPosApiHelper.checkIfUserExistByMobile(mobile);
        Boolean emailUserExist = false;
        if (!StringUtils.isEmpty(email)) {
            emailUserExist = apiPosApiHelper.checkIfUserExistByEmail(email);
        }
        if (iamUuidUserExist) {
            message.append("a pos account already exists with same uuid: ").append(iamUUID).append(",");
        }
        if (mobileUserExist) {
            message.append("a pos account already exists with same mobile: ").append(mobile).append(",");
        }
        if (emailUserExist) {
            message.append("a pos account already exists with same email: ").append(email).append(",");
        }
        if (message.length() > 0) {
            log.info("user already exist ");
            return Optional.of(message.toString());
        }
        return Optional.empty();
    }

    @Override
    public Optional<String> validate(CreateLeadRequestDto createLeadRequestDto) {
        String mobile = createLeadRequestDto.getMobile();
        String email = createLeadRequestDto.getEmail();
        String iamUUID = createLeadRequestDto.getUuid();
        return checkForDuplicateUser(iamUUID, mobile, email);
    }
}
