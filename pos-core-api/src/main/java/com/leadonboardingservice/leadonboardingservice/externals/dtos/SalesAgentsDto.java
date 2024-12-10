package com.leadonboardingservice.leadonboardingservice.externals.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SalesAgentsDto implements Serializable {

    private Integer id;
    @JsonProperty("designation_id")
    private Integer designationId;
    @JsonProperty("designation_name")
    private String designationName;
    @JsonProperty("designation_slug")
    private String designationSlug;
    @JsonProperty("name")
    private String name;
    @JsonProperty("mobile")
    private String mobile;
    @JsonProperty("email")
    private String email;
    @JsonProperty("masked_mobile")
    private String maskedMobile;
    @JsonProperty("masked_email")
    private String maskedEmail;
    @JsonProperty("employee_id")
    private String employeeId;
    @JsonProperty("iam_uuid")
    private String iamUUID;
    //@JsonProperty("tenant_ids")
   // private List<Integer> tenantIds;
}
