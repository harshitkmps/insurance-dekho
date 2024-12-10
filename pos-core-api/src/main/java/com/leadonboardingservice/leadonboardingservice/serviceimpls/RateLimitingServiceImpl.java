package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.exceptions.LimitExceedException;
import com.leadonboardingservice.leadonboardingservice.helpers.RedisHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class RateLimitingServiceImpl {

    private final RedisHelper redisHelper;

    //ToDo: more work needs to done
    public void resolve(String uuid) throws LimitExceedException {
        Integer count = redisHelper.get("los__cacheKey__kyc__"+uuid);
        if(count != null && count > 5){
            throw new LimitExceedException("Cannot update ckyc. Too many requests. Please try after some time");
        } else {
            if(count == null){
                count = 0;
            } else {
                count+=1;
            }
            redisHelper.setWithExpiry("los__cacheKey__kyc__" + uuid, count, 10L);
        }
    }

}
