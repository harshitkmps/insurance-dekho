package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.request.SyncLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.oldleads.OldLead;
import com.leadonboardingservice.leadonboardingservice.serviceimpls.LSQService;
import com.leadonboardingservice.leadonboardingservice.services.LeadSyncService;
import com.leadonboardingservice.leadonboardingservice.services.LeadMigrationService;
import com.leadonboardingservice.leadonboardingservice.services.LeadService;
import com.leadonboardingservice.leadonboardingservice.services.OldLeadService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("api/v1")
@AllArgsConstructor
@Slf4j
public class LeadSyncController {

    private final LeadMigrationService leadMigrationService;
    private final OldLeadService oldLeadService;
    private final LeadService leadService;
    private final LSQService lsqService;
    private final LeadSyncService leadSyncService;

    @PostMapping("/leads/migrate")
    @ResponseBody
    GenericResponse<?> migrateLeads(@Valid @RequestBody SyncLeadRequestDto syncLeadDto) throws Exception{
        //List<Long> migratedLeads = leadSyncService.migrateLeads(syncLeadDto);
        List<Long> response = new ArrayList<>();
        List<OldLead> leads;
        if (syncLeadDto.getFrom() != null && syncLeadDto.getTo() != null) {
            leads = oldLeadService.findByCreatedAtBetween(syncLeadDto.getFrom(), syncLeadDto.getTo());
        } else {
            leads = oldLeadService.findAllById(syncLeadDto.getIds());
        }
        CompletableFuture.runAsync(() -> {
            leads.forEach(lead -> {
                try {
                    leadMigrationService.migrateLeads(lead);
                    /*log.info("thread sleep --start");
                    TimeUnit.MILLISECONDS.sleep(500);
                    log.info("thread sleep --released");*/
                    //leadRepository.save(toLead);
                } catch (Exception e) {
                    e.printStackTrace();
                    log.error("unable to migrate lead {} with error {}",lead.getId(), e.getMessage());
                }

            });
        });
        leads.forEach(x -> response.add(x.getId()));
        return GenericResponse.<List<Long>>builder()
                .message("leads migration started")
                .statusCode(HttpStatus.OK.value())
                .data(response)
                .build();
    }

    @PostMapping("/leads/sync")
    @ResponseBody
    GenericResponse<?> syncLeads(@Valid @RequestBody SyncLeadRequestDto syncLeadDto) throws Exception{
        //List<Long> migratedLeads = leadSyncService.migrateLeads(syncLeadDto);
        List<Long> response = new ArrayList<>();
        List<Lead> leads;
        if (syncLeadDto.getFrom() != null && syncLeadDto.getTo() != null) {
            leads = leadService.findByCreatedAtBetween(syncLeadDto.getFrom(), syncLeadDto.getTo());
        } else {
            leads = leadService.findAllById(syncLeadDto.getIds());
        }
        CompletableFuture.runAsync(() -> {
            leads.forEach(lead -> {
                try {
                    leadMigrationService.syncLeads(lead.getId(),syncLeadDto);
                } catch (Exception e) {
                    log.error("unable to sync lead {} with error {}",lead.getId(), e.getMessage());
                }

            });
        });
        leads.forEach(x -> response.add(x.getId()));
        return GenericResponse.<List<Long>>builder()
                .message("leads sync started")
                .statusCode(HttpStatus.OK.value())
                .data(response)
                .build();
    }

    @PostMapping("/leads/sync/lsq")
    @ResponseBody
    GenericResponse<?> syncLeadsLSQ(@Valid @RequestBody SyncLeadRequestDto syncLeadDto) throws Exception{
        syncLeadDto.getIds().forEach(lsqService::upsertLead);
        return GenericResponse.<List<Long>>builder()
                .message("leads sync started")
                .statusCode(HttpStatus.OK.value())
                .data(null)
                .build();
    }

    @PostMapping("/leads/migrate-tbl-user")
    @ResponseBody
    GenericResponse<?> migrateLeadsFromUser(@Valid @RequestBody List<String> Uuids) throws Exception{
        CompletableFuture.runAsync(() -> {
            Uuids.forEach(uuid -> {
                try {
                    Lead lead = leadMigrationService.createLeadFromUser(uuid);
                    log.info("Success in create lead from user {} with leadId {} ", uuid, lead.getId());
                } catch (Exception e) {
                    log.error("unable to create lead from user {} with error {}", uuid , e.getMessage());
                }
            });
        });
        return GenericResponse.<List<Long>>builder()
                .message("leads migration form tbl_user started")
                .statusCode(HttpStatus.OK.value())
                .data(null)
                .build();
    }


    @GetMapping("/leads/sync-cps/{uuid}")
    @ResponseBody
    GenericResponse<?> syncLeadDataFromCps(@Valid @PathVariable String uuid) throws Exception{
        leadSyncService.syncLeadFromCps(uuid);
        return GenericResponse.<String>builder()
                .message("Lead synced successfully")
                .statusCode(HttpStatus.OK.value())
                .data(null)
                .build();
    }

    @GetMapping("/leads/sync-iam/{uuid}")
    @ResponseBody
    GenericResponse<?> syncLeadDataFromIam(@Valid @PathVariable String uuid) throws Exception{
        leadSyncService.syncLeadFromIAM(uuid);
        return GenericResponse.<String>builder()
                .message("Lead synced successfully")
                .statusCode(HttpStatus.OK.value())
                .data(null)
                .build();
    }
}
