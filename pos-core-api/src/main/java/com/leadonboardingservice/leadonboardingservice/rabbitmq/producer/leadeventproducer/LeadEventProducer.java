package com.leadonboardingservice.leadonboardingservice.rabbitmq.producer.leadeventproducer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.config.LeadEventRabbitMQConfig;
import com.leadonboardingservice.leadonboardingservice.dtos.request.SyncLeadRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class LeadEventProducer {
    private final LeadEventRabbitMQConfig leadEventRabbitMQConfig;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public void sendMessage(Long id) {
        ObjectNode objectNode = objectMapper.createObjectNode();
        objectNode.put("leadId", id);
        produce(objectNode);
    }

    public void produce(ObjectNode objectNode) {
        log.info("sending message to rabbitmq {}", objectNode);
        rabbitTemplate.convertAndSend(leadEventRabbitMQConfig.getExchange(),"", objectNode);
    }
}
