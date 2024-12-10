package com.leadonboardingservice.leadonboardingservice.externals.responsedtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.MetaData;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.SalesPersonDto;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SalesPersonResponseDto {
    private MetaData meta;
    private SalesPersonResponse data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SalesPersonResponse {
        @JsonProperty("data")
        List<SalesPersonDto> salesPersonDtoList;
        @JsonProperty("total_row_count")
        private Integer totalRowCount;
        @JsonProperty("current_page_last_row_number")
        private Integer lastRow;
    }
}
