package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.leadonboardingservice.leadonboardingservice.enums.InsuranceProduct;
import com.leadonboardingservice.leadonboardingservice.enums.TrainingStatuses;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeadTrainingStatusDto {
    @NotNull
    private InsuranceProduct insuranceType;

    @NotNull
    private TrainingStatuses status;
}
