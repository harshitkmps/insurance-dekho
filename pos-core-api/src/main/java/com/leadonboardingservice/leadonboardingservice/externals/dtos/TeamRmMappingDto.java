package com.leadonboardingservice.leadonboardingservice.externals.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.io.Serializable;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TeamRmMappingDto implements Serializable {
    @JsonProperty("team_uuid")
    private String teamUuid;
    @JsonProperty("reporting_manager_uuid")
    private String rmUuid;
}

