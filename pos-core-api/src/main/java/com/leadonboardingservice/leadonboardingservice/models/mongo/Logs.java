package com.leadonboardingservice.leadonboardingservice.models.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Document(collection = "tp_api_log")
public class Logs {
    @Id
    private String id;
    private String url;
    private Object request_data;
    private Object response_data;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public Logs(String url, Object request_data, Object response_data, LocalDateTime created_at, LocalDateTime updated_at) {
        super();
        this.url = url;
        this.request_data = request_data;
        this.response_data = response_data;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

}

