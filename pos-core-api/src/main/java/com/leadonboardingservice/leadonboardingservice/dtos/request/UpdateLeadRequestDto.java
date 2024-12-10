package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.leadonboardingservice.leadonboardingservice.annotations.ToLowerCase;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateLeadRequestDto {

    private String name;

    private Boolean isMobileVerified = false;

    //private String mobile;

    private Integer cityId;

    @ToLowerCase
    @Email(message = "Email should be valid")
    private String email;

    private LocalDate verifiedAt;

    private String assignedSalesIamUuid;

    private String referrerIamUuid;

    private String irdaId;

    private LocalDate irdaReportingDate;

    private String referenceAuthId;
}
