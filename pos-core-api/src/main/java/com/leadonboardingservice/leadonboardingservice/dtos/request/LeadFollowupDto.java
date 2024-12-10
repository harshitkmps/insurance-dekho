package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.leadonboardingservice.leadonboardingservice.enums.LeadFollowupStatuses;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeadFollowupDto {

    private LeadFollowupStatuses status;

    private String followupBy;

    private String remarks;

    private LocalDateTime followupAt;
}
