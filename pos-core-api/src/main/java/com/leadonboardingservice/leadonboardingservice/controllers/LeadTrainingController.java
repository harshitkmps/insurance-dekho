package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.request.LeadTrainingStatusDto;
import com.leadonboardingservice.leadonboardingservice.services.LeadManager;
import com.leadonboardingservice.leadonboardingservice.services.LeadTrainingService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("api/v1")
@SecurityRequirement(name = "los-api")
public class LeadTrainingController {

    private final LeadTrainingService leadTrainingService;
    private final LeadManager leadManager;

    @PutMapping("/leads/training/{leadId}")
    GenericResponse<?> updateLeadTrainingstatus(@PathVariable String leadId, @RequestBody LeadTrainingStatusDto leadTrainingStatusDto) throws Exception{
        leadManager.createOrUpdateLeadTrainingStatus(leadId, leadTrainingStatusDto);
        return GenericResponse.<String>builder()
                .message("lead training status updated successfully")
                .data("")
                .statusCode(HttpStatus.OK.value())
                .build();
    }
}
