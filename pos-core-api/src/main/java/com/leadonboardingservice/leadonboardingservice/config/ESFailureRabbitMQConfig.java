package com.leadonboardingservice.leadonboardingservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@EnableRabbit
@RequiredArgsConstructor
public class ESFailureRabbitMQConfig {

    @Value("${ide.rabbitmq.queue.lead-event-retry-name}")
    private String queue;

    @Value("${ide.rabbitmq.exchange.lead-event-retry-name}")
    private String exchange;

    @Value("${ide.rabbitmq.routing.lead-event-retry-key}")
    private String routingKey;

    // spring bean for rabbitmq queue
    @Bean
    public Queue failureQueue(){
        return new Queue(queue);
    }

    // spring bean for rabbitmq exchange
    @Bean
    public TopicExchange failureExchange(){
        return new TopicExchange(exchange);
    }

    // binding between queue and exchange using routing key
    @Bean
    public Binding failureBinding(){
        return BindingBuilder
                .bind(failureQueue())
                .to(failureExchange())
                .with(routingKey);
    }

    public String getQueue() {
        return queue;
    }

    public String getExchange() {
        return exchange;
    }

    public String getRoutingKey() {
        return routingKey;
    }

    @Bean
    public Jackson2JsonMessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }
}
