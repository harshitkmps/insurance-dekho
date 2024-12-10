package com.leadonboardingservice.leadonboardingservice.dtos.response;

import com.leadonboardingservice.leadonboardingservice.enums.LeadFollowupStatuses;
import lombok.Builder;
import lombok.Data;


import java.time.LocalDateTime;

@Data
@Builder
public class FollowupDto {
    private LeadFollowupStatuses status;

    private LocalDateTime followupAt;

    private String followupBy;

    private String remarks;
}
