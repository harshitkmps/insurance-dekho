package com.leadonboardingservice.leadonboardingservice.rabbitmq.consumer;

import com.fasterxml.jackson.databind.node.ObjectNode;

public interface LeadConsumer {
    void consume(ObjectNode message);
}
