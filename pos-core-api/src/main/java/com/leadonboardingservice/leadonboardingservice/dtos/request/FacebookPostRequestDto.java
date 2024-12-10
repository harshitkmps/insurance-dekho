package com.leadonboardingservice.leadonboardingservice.dtos.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FacebookPostRequestDto {

    private String object;
    private List<LeadGenEntryDTO> entry;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LeadGenEntryDTO {
        private long id;
        private long time;
        private List<LeadGenChangeDTO> changes;
    }
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LeadGenChangeDTO {
        private String field;
        private LeadGenValueDTO value;
    }
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LeadGenValueDTO {
        @JsonProperty("leadgen_id")
        private long leadgenId;
        @JsonProperty("page_id")
        private long pageId;
        @JsonProperty("form_id")
        private long formId;
        @JsonProperty("adgroup_id")
        private long adgroupId;
        @JsonProperty("ad_id")
        private long adId;
        @JsonProperty("created_time")
        private long createdTime;
    }

}
