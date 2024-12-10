package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.leadonboardingservice.leadonboardingservice.annotations.ToLowerCase;
import com.leadonboardingservice.leadonboardingservice.dtos.LeadSource;
import com.leadonboardingservice.leadonboardingservice.enums.LeadOriginChannels;
import com.leadonboardingservice.leadonboardingservice.enums.LeadOriginMethods;
import lombok.*;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.time.LocalDate;
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateLeadRequestDto {

    @Pattern(regexp="(^$|[0-9]{10})")
    @NotEmpty
    private String mobile;
    private String name;

    @Email
    @ToLowerCase
    private String email;

    private String uuid;

    private Boolean isMobileVerified = false;

    private LocalDate verifiedAt;

    private String referrerUserId;

    private String salesUserAssignId;

    @NotNull
    private LeadOriginChannels leadOrigin;

    @NotNull
    private LeadOriginMethods leadOriginMethods;

    private Boolean isWhatsappConsent = false;

    private LeadSource leadSource;

    private Long tenantId = 1L;

    private Integer cityId;

    private String referAuthId;
}
