package com.leadonboardingservice.leadonboardingservice.externals.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SalesPersonDto implements Serializable {
    private Integer id;
    @JsonProperty("tenant_id")
    private Integer tenantId;
    @JsonProperty("designation_id")
    private Integer designationId;
    @JsonProperty("employee_id")
    private String employeeId;
    private String name;
    private String mobile;
    private String mobileEncrypted;
    @JsonProperty("masked_mobile")
    private String mobileMasked;
    private String email;
    private String emailEncrypted;
    private String emailMasked;
    @JsonProperty("designation_slug")
    private String designationSlug;
    @JsonProperty("sales_agents")
    private Map<String, List<SalesAgentsDto>> salesAgentsHierarchy;
}
