package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.request.SyncLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.services.EsSyncService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("api/v1")
@AllArgsConstructor
@Slf4j
public class EsSyncController {
    private final EsSyncService esSyncService;

    @PostMapping("/leads/upsert")
    @ResponseBody
    GenericResponse<List<Long>> upsertLeads(@Valid @RequestBody SyncLeadRequestDto syncLeadDto) throws Exception{
        List<Long> upsertedLeads = esSyncService.upsertLeads(syncLeadDto);
        return GenericResponse.<List<Long>>builder()
                .message("lead sync successfully")
                .data(upsertedLeads)
                .statusCode(HttpStatus.OK.value())
                .build();
    }
}
