package com.leadonboardingservice.leadonboardingservice.models.mongo;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@Document(collection = "third_party_api_log")
public class ApiCall {
    @Id
    private String id;
    private String status;
    @Field("request_type")
    private String requestType;
    @Field("request_data")
    private ApiRequest request;
    @Field("response_data")
    private Object response;
    @Field("created_at")
    private LocalDateTime createdAt;
    @Field("updated_at")
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class ApiRequest {
        private Map<String,Object> apiRequest;
    }
}
