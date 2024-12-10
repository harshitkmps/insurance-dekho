package com.leadonboardingservice.leadonboardingservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class LeadEventRabbitMQConfig {
    @Value("${ide.rabbitmq.queue.lead-event-name}")
    private String leadEventEsQueue;

    @Value("${ide.rabbitmq.queue.lead-event-lsq-name}")
    private String leadEventLsqQueue;

    @Value("${ide.rabbitmq.exchange.lead-event-name}")
    private String exchange;

    @Value("${ide.rabbitmq.queue.lead-event-irdai-name}")
    private String leadEventIrdaiRegistrationQueue;

    @Value(("${ide.rabbitmq.queue.lead-event-irdai-dlq-name}"))
    private String leadEventIrdaDLQueue;

    // spring bean for rabbitmq queue
    @Bean
    public Queue leadEventEsQueue(){
        return new Queue(leadEventEsQueue);
    }

    @Bean
    public Queue leadEventLsqQueue(){
        return new Queue(leadEventLsqQueue);
    }

    @Bean
    public Queue leadEventIrdaiRegistrationQueue() {
        return new Queue(leadEventIrdaiRegistrationQueue);
    }

    @Bean
    public Queue leadEventIrdaDLQueue() {
        return new Queue(leadEventIrdaDLQueue);
    }

    // spring bean for rabbitmq exchange
    @Bean
    public FanoutExchange leadEventExchange(){
        return new FanoutExchange(exchange);
    }

    // binding between queue and exchange using routing key
    @Bean
    public Binding leadEventEsBinding(){
        return BindingBuilder
                .bind(leadEventEsQueue())
                .to(leadEventExchange());
    }

    @Bean
    public Binding leadEventBinding(){
        return BindingBuilder
                .bind(leadEventLsqQueue())
                .to(leadEventExchange());
    }

    public String getExchange() {
        return exchange;
    }

    public  String getLeadEventIrdaiRegistrationQueue() {
        return leadEventIrdaiRegistrationQueue;
    }

    public String getLeadEventIrdaDLQueue() {
        return leadEventIrdaDLQueue;
    }

    public String getLeadEventEsQueue() { return leadEventEsQueue; }


    /*public String getRoutingKey() {
        return routingKey;
    }*/

    @Bean
    public Jackson2JsonMessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }
}
