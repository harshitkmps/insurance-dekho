package com.leadonboardingservice.leadonboardingservice.rabbitmq.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.config.LeadEventRabbitMQConfig;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class IRDAIProducer {
    private final LeadEventRabbitMQConfig leadEventRabbitMQConfig;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public void sendMessage(Long id) {
        ObjectNode objectNode = objectMapper.createObjectNode();
        objectNode.put("leadId", id);
        produce(objectNode);
    }

    public void produce(ObjectNode objectNode) {
        log.info("sending message to irda queue {}", objectNode);
        rabbitTemplate.convertAndSend(leadEventRabbitMQConfig.getLeadEventIrdaiRegistrationQueue(), objectNode);
    }

    public void producerRetry(ObjectNode objectNode) {
        int retry = 0;
        if(objectNode.has("retry"))
            retry = objectNode.get("retry").asInt();
        objectNode.put("retry", retry+1);
        if(retry < LeadConstants.LEAD_IRDA_EVENT_RETRY_COUNT) {
            produce(objectNode);
        }else {
            log.info("sending message to irda dlq {}", objectNode);
            rabbitTemplate.convertAndSend(leadEventRabbitMQConfig.getLeadEventIrdaDLQueue(), objectNode);
        }
    }

}
