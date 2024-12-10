package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.enums.LeadStatus;
import com.leadonboardingservice.leadonboardingservice.externals.ApiPosApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.BrokerageMasterApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.ChannelPartnerServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.DocumentServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.ChannelPartnerDto;
import com.leadonboardingservice.leadonboardingservice.helpers.EncryptionHelper;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.User;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.serviceimpls.LeadMigrationServiceImpl;
import com.leadonboardingservice.leadonboardingservice.services.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("api/v1")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "los-api")
public class TestController {

    private final LeadRepository leadRepository;
    private final ChannelPartnerServiceApiHelper channelPartnerServiceApiHelper;
    private final PosUserService posUserService;
    private final AsyncEsSyncService esSyncService;


    @GetMapping("/test")
    public ResponseEntity<?> testMethod() throws Exception {
        try {
//            Lead lead = leadRepository.findByUuid("753a7052-f28d-4fc0-ba0e-3dbe14f99cf0").orElseThrow();
//            lead.decryptAllPiiFields();
//            ChannelPartnerDto channelPartnerResponseDto = channelPartnerServiceApiHelper.getByChannelPartnerIamId(lead.getUuid());
//            posUserService.createUserInPos(channelPartnerResponseDto, lead);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());

        }
        return ResponseEntity.status(200).body("testing");
    }

    @GetMapping("/create-user/{leadId}")
    GenericResponse<String> getLeadDetails(@PathVariable String leadId) throws Exception {
        try {
            Lead lead = leadRepository.findByUuid(leadId).orElseThrow(
                    () -> new RuntimeException("Lead with the given iam_uuid not found " + leadId));
            Optional<User> activeUser = posUserService.getUserByUUID(leadId);
            if (activeUser.isPresent()) {
                throw new RuntimeException("User already exist with given iam_uuid " + leadId);
            }
            lead.decryptAllPiiFields();
            lead.getLeadProfile().decryptAllPiiFields();
            ChannelPartnerDto channelPartnerResponseDto = channelPartnerServiceApiHelper.getByChannelPartnerIamId(lead.getUuid());
            Optional<User> optionalUser = posUserService.createUserInPos(channelPartnerResponseDto, lead);
            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                lead.setStatus(LeadStatus.REGISTERED);
                lead.setChannelPartnerId(channelPartnerResponseDto.getChannelPartnerId());
                leadRepository.save(lead);
                esSyncService.upsertLeadAsync(lead.getId());
                esSyncService.upsertPosUserCreationAsync(channelPartnerResponseDto.getGcdCode());
            }
            return GenericResponse.<String>builder()
                    .message("User created successfully")
                    .data("OK")
                    .statusCode(HttpStatus.OK.value())
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            log.error("Error while creating user for leadId {}, error: {}", leadId, e.getMessage());
            throw e;
        }
    }
}

