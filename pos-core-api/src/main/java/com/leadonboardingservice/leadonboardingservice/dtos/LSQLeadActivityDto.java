package com.leadonboardingservice.leadonboardingservice.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class LSQLeadActivityDto {
    @JsonProperty("ActivityEvent")
    private Integer activityEvent;
    @JsonProperty("ActivityNote")
    private String activityNote;
    @JsonProperty("Fields")
    private List<LSQFieldsDto> lsqFieldsDtoList;
}
