package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.rabbitmq.producer.IRDAIProducer;
import com.leadonboardingservice.leadonboardingservice.rabbitmq.producer.PosUserCreationProducer;
import com.leadonboardingservice.leadonboardingservice.rabbitmq.producer.leadeventproducer.LeadEventProducer;
import com.leadonboardingservice.leadonboardingservice.services.AsyncEsSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AsyncEsSyncServiceImpl implements AsyncEsSyncService {
    private final LeadEventProducer leadEventProducer;
    private final IRDAIProducer irdaiProducer;
    private final PosUserCreationProducer posUserCreationProducer;

    @Override
    public void upsertLeadAsync(Long id) {
        CompletableFuture.runAsync(() -> {
            log.info("pushing lead event to queue for lead id {}",id);
            leadEventProducer.sendMessage(id);
        });
    }

    @Override
    public void upsertLeadIrdaiEventAsync(Long id) {
        CompletableFuture.runAsync(() -> {
            log.info("pushing lead irdai event to queue for the lead id {}",id);
            irdaiProducer.sendMessage(id);
        });
    }

    @Override
    public void upsertPosUserCreationAsync(String gcdCode) {
     CompletableFuture.runAsync(() -> {
         log.info("pushing user creation event into pos user creation exchange for gcd {}", gcdCode);
         posUserCreationProducer.sendMessage(gcdCode);
     });
    }

}
