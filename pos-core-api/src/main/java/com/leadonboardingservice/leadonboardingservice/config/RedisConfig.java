package com.leadonboardingservice.leadonboardingservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class RedisConfig {
    @Bean
    public RedisTemplate<?, ?> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<?,?> myRedisTemplate = new RedisTemplate<>();
        myRedisTemplate.setConnectionFactory(connectionFactory);
        myRedisTemplate.setKeySerializer(new StringRedisSerializer());
        myRedisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return myRedisTemplate;
    }

    @Bean
    RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        return (builder) -> {
            Map<String, RedisCacheConfiguration> configurationMap = new HashMap<>();
            configurationMap.put("los__channel__partners", RedisCacheConfiguration
                    .defaultCacheConfig(Thread.currentThread().getContextClassLoader())
                    .entryTtl(Duration.ofSeconds(1200)));
            configurationMap.put("los__sales__profile", RedisCacheConfiguration
                    .defaultCacheConfig(Thread.currentThread().getContextClassLoader())
                    .entryTtl(Duration.ofSeconds(1200)));
            builder.withInitialCacheConfigurations(configurationMap);
        };
    }
}
