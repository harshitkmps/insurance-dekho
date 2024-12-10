package com.leadonboardingservice.leadonboardingservice.rabbitmq.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.config.UserCreationRabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class PosUserCreationProducer {
    private final UserCreationRabbitMQConfig userCreationRabbitMQConfig;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public void sendMessage(String gcdCode) {
        ObjectNode objectNode = objectMapper.createObjectNode();
        objectNode.put("gcdCode", gcdCode);
        produce(objectNode);
    }

    public void produce(ObjectNode objectNode) {
        log.info("sending message to pos user creation exchange {}", objectNode);
        rabbitTemplate.convertAndSend(
                userCreationRabbitMQConfig.getExchange(),
                userCreationRabbitMQConfig.getRoutingKey(),
                objectNode
        );
    }
}
