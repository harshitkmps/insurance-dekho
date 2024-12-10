package com.leadonboardingservice.leadonboardingservice.config;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Getter
@Slf4j
@Configuration
@RequiredArgsConstructor
public class UserCreationRabbitMQConfig {

    @Value("${ide.rabbitmq.exchange.pos-user-creation-name}")
    private String exchange;

    @Value("${ide.rabbitmq.routing.pos-user-creation-name}")
    private String routingKey;

    @Bean
    public DirectExchange posUserCreationExchange(){
        return new DirectExchange(exchange);
    }

}
