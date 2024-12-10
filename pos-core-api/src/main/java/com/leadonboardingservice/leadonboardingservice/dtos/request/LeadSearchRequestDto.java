package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.leadonboardingservice.leadonboardingservice.enums.DateFilterField;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Pattern;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeadSearchRequestDto {
    @Pattern(regexp = "pending|registered|reg_requested|doc_invalid|rejected|follow_up|close")
    private String leadState;
    private String from;
    private String to;
    private Integer size = 10;
    private String generalInsuranceExamStatus;
    private String lifeInsuranceExamStatus;
    private int irdaRegistered;
    private int getAllLeads;
    private int isAggregate;
    private DateFilterField dateFilterField;
    private String filterInput;
    private String referDealerId;
    private String uuid;
    private String leadUuid;
    private String utmSource;
    private String reRegister;
    private String searchAfter;
    private String prevPage;
    private Integer tenantId;
}
