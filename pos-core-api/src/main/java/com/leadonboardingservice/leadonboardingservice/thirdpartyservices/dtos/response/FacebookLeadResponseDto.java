package com.leadonboardingservice.leadonboardingservice.thirdpartyservices.dtos.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.leadonboardingservice.leadonboardingservice.constants.CampaignConstants;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FacebookLeadResponseDto {
    @JsonProperty("created_time")
    private String createdTime;
    private String id;
    @JsonProperty("field_data")
    private List<FieldDataDTO> fieldData;
    private Map<String,String> requestMap = new HashMap<>();
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FieldDataDTO {
        private String name;
        private List<String> values;
    }

    public String getValue(String key) {
        if(this.requestMap.isEmpty()) {
            this.getFieldData().forEach(x -> requestMap.put(x.getName(),x.getValues().get(0)));
        }
        return requestMap.get(key);
    }

    public String getUtmMedium(String key) {
        String medium = getValue(key);
        if(medium != null) {
            return medium;
        }
        return CampaignConstants.MEDIUM;
    }

    public String getUtmCampaign(String key) {
        String campaign = getValue(key);
        if (campaign != null) {
            return campaign;
        }
        return CampaignConstants.CAMPAIGN;
    }
}
