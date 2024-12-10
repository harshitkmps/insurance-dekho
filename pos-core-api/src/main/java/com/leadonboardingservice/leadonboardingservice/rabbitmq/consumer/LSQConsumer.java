package com.leadonboardingservice.leadonboardingservice.rabbitmq.consumer;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.rabbitmq.producer.lsqproducer.LSQFailureProducer;
import com.leadonboardingservice.leadonboardingservice.serviceimpls.LSQService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class LSQConsumer implements LeadConsumer {

    private final LSQService lsqService;
    private final LSQFailureProducer lsqFailureProducer;

    @RabbitListener(queues = {"${ide.rabbitmq.queue.lead-event-lsq-name}"}, exclusive = true)
    public void consume(ObjectNode message){
        try {
            log.info("[LSQConsumer] message consumed from rabbitmq {}", message);
            Long leadId = message.get("leadId").asLong();
            lsqService.upsertLead(leadId);
        }catch (Exception e){
            log.error("error while upserting data to lsq {}", e.getMessage());
            lsqFailureProducer.produce(message);
        }
    }

    @RabbitListener(queues = {"${ide.rabbitmq.queue.lsq-event-retry-name}"}, exclusive = true)
    public void consumeFailedMessages(ObjectNode message){
        try {
            log.info("[LSQRetryConsumer] message consumed from rabbitmq {}", message);
            Long leadId = message.get("leadId").asLong();
            lsqService.upsertLead(leadId);
        } catch (Exception e){
            log.error("error while upserting data to lsq failure queue {}", e.getMessage());
            int retry = 0;
            if(message.has("retry"))
                retry = message.get("retry").asInt();
            message.put("retry", retry+1);
            if(retry < LeadConstants.LEAD_EVENT_RETRY_COUNT) {
                lsqFailureProducer.produce(message);
            }
        }
    }
}
