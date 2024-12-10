package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.leadonboardingservice.leadonboardingservice.enums.LeadTrigger;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeadStatusEventRequestDto {
    @NotNull
    private String leadId;
    private LeadTrigger leadTrigger;
    private Map<String,String> data;
}
