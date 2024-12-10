package com.leadonboardingservice.leadonboardingservice.rabbitmq.producer.lsqproducer;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.config.LSQFailureRabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessagePostProcessor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class LSQFailureProducer {
    private final LSQFailureRabbitMQConfig lsqFailureRabbitMQConfig;
    private final RabbitTemplate rabbitTemplate;

    public void produce(ObjectNode objectNode){
        log.info("sending message to lsqFailureQueue {}", objectNode);
        rabbitTemplate.convertAndSend(lsqFailureRabbitMQConfig.getExchange(), lsqFailureRabbitMQConfig.getRoutingKey(), objectNode, new MessagePostProcessor() {
            @Override
            public Message postProcessMessage(Message message) throws AmqpException {
                message.getMessageProperties().setHeader("x-delay", 15000);
                return message;
            }
        });
    }
}
