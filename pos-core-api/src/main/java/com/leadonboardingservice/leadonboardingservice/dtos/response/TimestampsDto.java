package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class TimestampsDto {
    private LocalDateTime timeStamp;

    private String event;
}
