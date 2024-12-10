package com.leadonboardingservice.leadonboardingservice.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNocStatusRequestDto {
    @NotNull
    private String leadId;
    @NotNull
    @Pattern(regexp = "^[01]$", message = "NOC status can only be 0 or 1")
    private String nocStatus;
}
