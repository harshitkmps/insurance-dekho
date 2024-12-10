package com.leadonboardingservice.leadonboardingservice.helpers;

import com.google.common.hash.Hashing;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
@Component
public class HashGenerator {

    private static final String HASH_KEY = "$2a$10$smD..w8VWPktQKGCFSEmbu";

    public String generate(String data) {
        return Hashing
                .hmacSha256(HASH_KEY.getBytes())
                .hashString(data, StandardCharsets.UTF_8)
                .toString();
    }

}
