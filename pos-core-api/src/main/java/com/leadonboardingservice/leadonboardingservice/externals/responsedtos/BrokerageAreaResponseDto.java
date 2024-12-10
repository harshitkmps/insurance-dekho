package com.leadonboardingservice.leadonboardingservice.externals.responsedtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BrokerageAreaResponseDto {

    private List<BrokerageAreaDto> data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BrokerageAreaDto {
        private Integer cityId;
        private String cityName;
        private Integer stateId;
        private String stateName;
        private List<Area> areas;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Area {

        private Long id;
        private String areaName;
        private String longitude;
        private String latitude;
    }
}
