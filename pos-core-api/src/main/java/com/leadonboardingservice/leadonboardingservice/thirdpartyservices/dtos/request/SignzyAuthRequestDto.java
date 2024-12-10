package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignzyAuthRequestDto {
    private String username;
    private String password;
}
