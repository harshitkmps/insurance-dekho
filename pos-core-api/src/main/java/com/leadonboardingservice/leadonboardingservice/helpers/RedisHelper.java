package com.leadonboardingservice.leadonboardingservice.helpers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
@Slf4j
@RequiredArgsConstructor
public class RedisHelper {

    private final RedisTemplate redisTemplate;

    public <T> void setWithExpiry(String key, T value, Long expiry){
        redisTemplate.opsForValue().set(key,value,expiry, TimeUnit.MINUTES);
    }

    public <T> T get(String key){
        return (T) redisTemplate.opsForValue().get(key);
    }
}
