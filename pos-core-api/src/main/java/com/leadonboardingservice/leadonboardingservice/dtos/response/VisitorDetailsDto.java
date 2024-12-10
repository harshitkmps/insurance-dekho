package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
public class VisitorDetailsDto {
    private String id;

    private String uuid;

    private String name;

    private String mobileMasked;

    private String mobile;

    private String emailMasked;

    private  String email;

    private String assignedSalesIamUuid;

    private String status;

    private String createdBy;

    private String modifiedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
