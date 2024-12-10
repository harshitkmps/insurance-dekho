package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.request.*;
import com.leadonboardingservice.leadonboardingservice.dtos.response.*;
import com.leadonboardingservice.leadonboardingservice.exceptions.CampaignException;
import com.leadonboardingservice.leadonboardingservice.services.CampaignsService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("api/v1")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "los-api")
public class CampaignsController {

    private final CampaignsService campaignsService;

    @Value("${ide.facebook-webhook.verification-token}")
    private String verificationToken;

    @GetMapping("/campaigns/fb")
    String verifyFbToken(@RequestParam("hub.challenge") String hubChallenge, @RequestParam("hub.verify_token") String hubToken) throws Exception {
        log.info("Verification Request for FB token: {} .", hubToken);
        if (!hubToken.equals(verificationToken)) {
            log.error("Verification got failed with token: {} .", hubToken);
            throw new CampaignException("Invalid Token from FB request");
        }
        log.info("FB token Verification occurred successfully");
        return hubChallenge;
    }

    @PostMapping("/campaigns/fb")
    GenericResponse<List<CreateLeadResponseDto>> fbEvents(@RequestBody FacebookPostRequestDto requestBody) throws Exception{
        log.info("FB event received : {} .", requestBody);
        List<CreateLeadResponseDto> responseDto = campaignsService.onboardFacebookLead(requestBody);
        return GenericResponse.<List<CreateLeadResponseDto>>builder()
                .message("Event received successfully")
                .data(responseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }
}
