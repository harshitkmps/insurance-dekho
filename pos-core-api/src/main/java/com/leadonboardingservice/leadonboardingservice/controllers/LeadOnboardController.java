package com.leadonboardingservice.leadonboardingservice.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.request.*;
import com.leadonboardingservice.leadonboardingservice.dtos.response.*;
import com.leadonboardingservice.leadonboardingservice.exceptions.ValidationException;
import com.leadonboardingservice.leadonboardingservice.helpers.CommonUtils;
import com.leadonboardingservice.leadonboardingservice.helpers.HashGenerator;
import com.leadonboardingservice.leadonboardingservice.serviceimpls.LeadEventServiceImpl;
import com.leadonboardingservice.leadonboardingservice.services.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("api/v1")
@AllArgsConstructor
@Slf4j
@SecurityRequirement(name = "los-api")
public class LeadOnboardController {

    private final LeadSearchService leadSearchService;
    private final LeadManager leadManager;
    private final LeadEventServiceImpl leadEventService;
    private final HashGenerator hashGenerator;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/leads")
    @ResponseBody
    GenericResponse<CreateLeadResponseDto> createLead( @Valid @RequestBody CreateLeadRequestDto createLeadDto) throws Exception{
        //CreateLeadResponseDto lead = leadService.createLead(createLeadDto);
        if(!StringUtils.isEmpty(createLeadDto.getEmail())) {
            validateEmail(createLeadDto.getEmail());
        }
        CreateLeadResponseDto lead = leadManager.createLead(createLeadDto);
        return GenericResponse.<CreateLeadResponseDto>builder()
                .message("lead created successfully")
                .data(lead)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    private void validateEmail(String email) throws ValidationException {
        if(CommonUtils.extractDomain(email).equalsIgnoreCase("insurancedekho.com")){
            throw new ValidationException("@insurancedekho.com domain not allowed");
        }
    }

    @PostMapping("/leads/search")
    GenericResponse<?> getLeadsList(@RequestBody @Valid LeadSearchRequestDto leadSearchRequestDto) throws Exception{
        log.info("searching for leads with request {}",leadSearchRequestDto);
        Map<String,Object> requestParams = objectMapper.convertValue(leadSearchRequestDto,new TypeReference<Map<String, Object>>() {});
        requestParams.values().removeIf(value -> value == null || value.toString().isEmpty());
        if(requestParams.containsKey("searchAfter")){
            List<String> next = Arrays.asList(requestParams.get("searchAfter").toString().split("\\s*,\\s*"));
            requestParams.put("searchAfter",next);
        }
        if(leadSearchRequestDto.getFilterInput() != null){
            if(CommonUtils.isMobileOrEmail(leadSearchRequestDto.getFilterInput())){
                requestParams.put("filterInput",hashGenerator.generate(leadSearchRequestDto.getFilterInput()));
            } else if(!CommonUtils.isNumeric(leadSearchRequestDto.getFilterInput())){
                requestParams.put("name",leadSearchRequestDto.getFilterInput());
            }
        }
        log.info("searching for leads with params after removing null values {}",requestParams);
        if(requestParams.containsKey("isAggregate") && Objects.equals(requestParams.get("isAggregate").toString(), "1")){
            LeadListResponseDto response = leadSearchService.searchLeadsWithAggregation(requestParams);
            return GenericResponse.<LeadListResponseDto>builder()
                    .message("lead search successfully")
                    .data(response)
                    .statusCode(HttpStatus.OK.value())
                    .build();
        }
        LeadListResponseDto leadListResponseDto = leadSearchService.searchLeads(requestParams);
        return GenericResponse.<LeadListResponseDto>builder()
                .message("lead search successfully")
                .data(leadListResponseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @GetMapping("/leads/{leadId}")
    GenericResponse<LeadDetailsResponseDto> getLeadDetails(@PathVariable String leadId ,@RequestParam Map<String, String> requestParams) throws Exception{
        LeadDetailsResponseDto responseDto = leadManager.getLeadDetails(leadId);
        return GenericResponse.<LeadDetailsResponseDto>builder()
                .message("lead details fetched successfully")
                .data(responseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PutMapping("/leads/{leadId}")
    GenericResponse<LeadDetailsDto> updateLeadBasicDetails(@PathVariable String leadId, @Valid @RequestBody UpdateLeadRequestDto updateLeadRequestDto) throws Exception{
        if(!StringUtils.isEmpty(updateLeadRequestDto.getEmail())) {
            validateEmail(updateLeadRequestDto.getEmail());
        }
        LeadDetailsDto responseDto = leadManager.updateLeadBasicDetails(leadId, updateLeadRequestDto);
        return GenericResponse.<LeadDetailsDto>builder()
                .message("lead updated successfully")
                .data(responseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PutMapping("/leads/profile/{leadId}")
    GenericResponse<LeadProfileDto> updateLeadKycDetails(@PathVariable String leadId, @RequestBody @Valid LeadProfileDto leadProfileDto) throws Exception{
        LeadProfileDto responseDto = leadManager.updateLeadProfile(leadId, leadProfileDto);
        return GenericResponse.<LeadProfileDto>builder()
                .message("lead profile details updated successfully")
                .data(responseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PutMapping("/leads/bank/{leadId}")
    GenericResponse<LeadBankDetailsResponseDto> updateLeadBankDetails(@PathVariable String leadId, @RequestBody @Valid LeadBankDto leadBankDto) throws Exception{
        LeadBankDetailsResponseDto responseDto = leadManager.updateLeadBankDetails(leadId, leadBankDto);
        return GenericResponse.<LeadBankDetailsResponseDto>builder()
                .message("lead bank details saved successfully")
                .data(responseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PutMapping("/leads/address/{leadId}")
    GenericResponse<LeadAddressDetailsResponseDto> updateLeadAddressDetails(@PathVariable String leadId, @RequestBody @Valid LeadAddressRequestDto leadAddressRequestDto) throws Exception{
        LeadAddressDetailsResponseDto responseDto = leadManager.addLeadAddressDetails(leadId, leadAddressRequestDto);
        return GenericResponse.<LeadAddressDetailsResponseDto>builder()
                .message("lead address details saved successfully")
                .data(responseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PutMapping("/leads/followup/{leadId}")
    GenericResponse<LeadFollowupResponseDto> updateLeadFollowupDetails(@PathVariable String leadId, @RequestBody @Valid LeadFollowupDto leadFollowupDto) throws Exception{
        LeadFollowupResponseDto responseDto = leadManager.updateLeadFollowupDetails(leadId, leadFollowupDto);
        return GenericResponse.<LeadFollowupResponseDto>builder()
                .message("lead follow details updated successfully")
                .data(responseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PostMapping("/leads/document/{leadId}")
    GenericResponse<LeadDocumentDto> uploadLeadDocument(@PathVariable String leadId, @RequestBody @Valid LeadDocumentDto leadDocumentDto) throws Exception{
        LeadDocumentDto documentDto = leadManager.addLeadDocument(leadId, leadDocumentDto);
        return GenericResponse.<LeadDocumentDto>builder()
                .data(documentDto)
                .message("lead document details saved successfully")
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PostMapping("/leads/event")
    GenericResponse<String> leadTrigger(@RequestBody @Valid LeadStatusEventRequestDto leadStatusEventRequestDto) throws ValidationException {
        leadEventService.triggerEvent(leadStatusEventRequestDto);
        return GenericResponse.<String>builder()
                .message("lead event triggered")
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PutMapping("/leads/additional-details/{leadId}")
    @ResponseBody
    GenericResponse<LeadAdditionalDetailsResponseDto> additionalDetails(@PathVariable String leadId, @Valid @RequestBody LeadAdditionalDetailsRequestDto leadAdditionalDetailsRequestDto) throws Exception{
        LeadAdditionalDetailsResponseDto responseDto = leadManager.addAdditionalDetails(leadId,leadAdditionalDetailsRequestDto);
        return GenericResponse.<LeadAdditionalDetailsResponseDto>builder()
                .message("lead additional details added")
                .data(responseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PostMapping("/leads/additional-details/{leadId}")
    @ResponseBody
    GenericResponse<LeadAdditionalDetailsResponseDto> findAdditionalDetails(@PathVariable String leadId,@Valid @RequestBody LeadAdditionalDetailsRequestDto leadAdditionalDetailsRequestDto){
        LeadAdditionalDetailsResponseDto responseDto = leadManager.getAdditionalDetails(leadId, leadAdditionalDetailsRequestDto);
        return GenericResponse.<LeadAdditionalDetailsResponseDto>builder()
                .message("lead additional details fetched successfully")
                .data(responseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }
    @GetMapping("/leads/qc-eligibility/{leadId}")
    GenericResponse<String> checkLeadEligibleForQC(@PathVariable String leadId) throws Exception{
        leadManager.checkLeadEligibleForQC(leadId);
        return GenericResponse.<String>builder()
                .message("lead eligible for QC")
                .statusCode(HttpStatus.OK.value())
                .build();
    }
}
