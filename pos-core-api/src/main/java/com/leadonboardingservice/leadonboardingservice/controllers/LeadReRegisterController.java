package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.request.UpdateNocStatusRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.NocResponseDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.PanValidationRequestDto;
import com.leadonboardingservice.leadonboardingservice.services.LeadSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadReRegisterService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("api/v1")
@AllArgsConstructor
@Slf4j
@SecurityRequirement(name = "los-api")
public class LeadReRegisterController {

    private final LeadSyncService leadSyncService;
    private final LeadReRegisterService leadReRegisterService;

    @PutMapping("leads/re-register/{leadId}")
    GenericResponse<String> reRegisterLead(@PathVariable String leadId) throws Exception{
        leadSyncService.syncLeadFromCps(leadId);
        leadReRegisterService.reRegisterLead(leadId);
        return GenericResponse.<String>builder()
                .message("Lead migrated Successfully")
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PostMapping("leads/noc-required/{leadId}")
    @ResponseBody
    GenericResponse<NocResponseDto> checkForNoc(@PathVariable String leadId, @Valid @RequestBody PanValidationRequestDto panValidationRequestDto) throws Exception{
        NocResponseDto responseDto = leadReRegisterService.checkNocStatus(leadId, panValidationRequestDto);
        return GenericResponse.<NocResponseDto>builder()
                .message("Success")
                .statusCode(HttpStatus.OK.value())
                .data(responseDto)
                .build();
    }

    @PutMapping("leads/update-noc-status")
    @ResponseBody
    GenericResponse<String> updateNocStatus(@Valid @RequestBody UpdateNocStatusRequestDto requestDto) throws Exception {
        leadReRegisterService.updateNocStatus(requestDto.getLeadId(), requestDto.getNocStatus());
        return GenericResponse.<String>builder()
                .message("Noc status Updated")
                .statusCode(HttpStatus.OK.value())
                .build();
    }
}
