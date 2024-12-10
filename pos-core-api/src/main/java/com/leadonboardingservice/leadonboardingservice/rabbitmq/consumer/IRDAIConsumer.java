package com.leadonboardingservice.leadonboardingservice.rabbitmq.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.rabbitmq.producer.IRDAIProducer;
import com.leadonboardingservice.leadonboardingservice.services.IRDAIRegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;


@Slf4j
@Component
@RequiredArgsConstructor
public class IRDAIConsumer implements LeadConsumer {
    private final IRDAIRegistrationService irdaiRegistrationService;
    private final ObjectMapper objectMapper;
    private final IRDAIProducer irdaiProducer;

    @RabbitListener(queues = {"${ide.rabbitmq.queue.lead-event-irdai-name}"}, exclusive = true)
    public void consume(ObjectNode message) {
        try {
            log.info("[IRDAIConsumer] message consumed from rabbitmq {}", message);
            Long leadId = message.get("leadId").asLong();
            irdaiRegistrationService.upsertLead(leadId);
        }catch(Exception e) {
            log.error("error while consuming irda event message {} Exception {}.", message, e.getMessage());
            irdaiProducer.producerRetry(message);
        }
    }
}
