package com.leadonboardingservice.leadonboardingservice.dtos.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.leadonboardingservice.leadonboardingservice.dtos.PaginationDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;
@Data
@Builder
public class LeadListResponseDto {

    private JsonNode buckets;
    private List<LeadResponseDto> data;
    @JsonProperty("pagination")
    private PaginationDto paginationDto;
}
