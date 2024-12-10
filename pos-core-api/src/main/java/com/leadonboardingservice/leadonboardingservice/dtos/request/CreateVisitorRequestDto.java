package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import liquibase.pro.packaged.S;
import lombok.*;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateVisitorRequestDto {
    @NotEmpty
    private String name;

    @NotEmpty
    private  String mobile;

    private String mobileEncrypted;

    private String email;

    private String emailEncrypted;

    private String assignedSalesIamUuid;

    private String status;
}
