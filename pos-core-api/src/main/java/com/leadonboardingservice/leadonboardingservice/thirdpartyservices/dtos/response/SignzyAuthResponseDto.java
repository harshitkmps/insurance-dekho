package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignzyAuthResponseDto {
    private String id;
    private String ttl;
    private String created;
    private String userId;
}
