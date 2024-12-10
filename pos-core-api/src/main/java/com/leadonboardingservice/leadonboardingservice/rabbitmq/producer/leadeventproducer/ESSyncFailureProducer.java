package com.leadonboardingservice.leadonboardingservice.rabbitmq.producer.leadeventproducer;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.config.ESFailureRabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class ESSyncFailureProducer {
    private final ESFailureRabbitMQConfig esSyncFailureRabbitMQConfig;
    private final RabbitTemplate rabbitTemplate;

    public void produce(ObjectNode objectNode) {
        log.info("sending message to rabbitmq {}", objectNode);
        rabbitTemplate.convertAndSend(esSyncFailureRabbitMQConfig.getExchange(),esSyncFailureRabbitMQConfig.getRoutingKey(), objectNode);
    }
}
