package com.leadonboardingservice.leadonboardingservice.externals.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DocumentServiceResponseDto {
    @JsonProperty("metaData")
    private MetaData metaData;
    @JsonProperty("data")
    private Document data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Document{
        @JsonProperty("doc_id")
        private String docId;
    }

    public Document getData() {
        return data;
    }
}
