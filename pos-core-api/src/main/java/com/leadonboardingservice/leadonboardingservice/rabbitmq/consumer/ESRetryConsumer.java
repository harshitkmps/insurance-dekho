package com.leadonboardingservice.leadonboardingservice.rabbitmq.consumer;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.serviceimpls.ElasticSearchServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ESRetryConsumer {
    private final ElasticSearchServiceImpl leadConsumer;
    @RabbitListener(queues = {"${ide.rabbitmq.queue.lead-event-retry-name}"}, exclusive = true)
    public void consumeFailedMessages(ObjectNode message){
        log.info("[ESRetryConsumer] message consumed from rabbitmq {}", message);
        leadConsumer.consume(message);
    }
}
