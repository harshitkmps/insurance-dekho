package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.request.ValidateAadhaarOtpRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.request.OtpRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.LeadDetailsResponseDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.AadhaarOtpResponseData;
import com.leadonboardingservice.leadonboardingservice.services.LeadManager;
import com.leadonboardingservice.leadonboardingservice.services.AadhaarService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("api/v1/leads/aadhaar")
@AllArgsConstructor
@SecurityRequirement(name = "los-api")
public class AadhaarController {

    private final AadhaarService aadhaarService;
    private final LeadManager leadManager;

    @PostMapping("/otp")
    @ResponseBody
    GenericResponse<AadhaarOtpResponseData> sendOtp(@RequestBody @Valid OtpRequestDto otpRequestDto) throws Exception{
        AadhaarOtpResponseData otpResponse = aadhaarService.sendAadhaarOtp(otpRequestDto);
        return GenericResponse.<AadhaarOtpResponseData>builder()
                .message("Otp sent successful")
                .data(otpResponse)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PostMapping("/{leadId}")
    @ResponseBody
    GenericResponse<LeadDetailsResponseDto> submitOtp(@PathVariable String leadId, @Valid @RequestBody ValidateAadhaarOtpRequestDto submitOtpRequestDto) throws Exception{
        LeadDetailsResponseDto lead = leadManager.fetchLeadAadhaarDetails(leadId,submitOtpRequestDto);
        return GenericResponse.<LeadDetailsResponseDto>builder()
                .message("lead aadhaar details fetched successfully")
                .data(lead)
                .statusCode(HttpStatus.OK.value())
                .build();
    }
}
