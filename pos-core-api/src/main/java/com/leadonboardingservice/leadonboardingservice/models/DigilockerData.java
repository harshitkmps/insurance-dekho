package com.leadonboardingservice.leadonboardingservice.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Document(collection = "ckyc_data")
public class DigilockerData {
    @Id
    private String id;
    @Field("pan_number")
    private String panNumber;
    @Field("date_of_birth")
    private String dateOfBirth;
    private String response;
    @Field("created_at")
    private LocalDateTime createdAt;
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
