package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.dtos.request.SyncLeadRequestDto;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.rabbitmq.producer.leadeventproducer.LeadEventProducer;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.EsSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
@Transactional(propagation = Propagation.REQUIRES_NEW)
@RequiredArgsConstructor
public class EsSyncServiceImpl implements EsSyncService {
    private final LeadRepository leadRepository;
    private final LeadEventProducer leadEventProducer;

    @Override
    public List<Long> upsertLeads(SyncLeadRequestDto syncLeadDto) {
        log.info("initiating sync in elastic search for request {} ",syncLeadDto);
        List<Long> response = new ArrayList<>();
        if (syncLeadDto.getFrom() != null && syncLeadDto.getTo() != null) {
            String fromDate = syncLeadDto.getFrom().toString();
            LocalDateTime from = LocalDate.parse(fromDate, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay();
            String toDate = syncLeadDto.getTo().toString();
            LocalDateTime to = LocalDate.parse(toDate, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay();
            List<Lead> leads ;
            if(syncLeadDto.isOnUpdatedAt()){
                 leads = leadRepository.findByUpdatedAtBetween(from, to);
            } else {
                 leads = leadRepository.findByCreatedAtBetween(from, to);
            }
            leads.forEach(lead -> {
                leadEventProducer.sendMessage(lead.getId());
                response.add(lead.getId());
            });

        } else {
            syncLeadDto.getIds().forEach(i -> {
                log.info("syncing lead in es. LeadId {}",i);
                leadEventProducer.sendMessage(i);
                response.add(i);
            });
        }
        log.info("Ids inserted into elastic {}", response);
        return response;
    }
}
