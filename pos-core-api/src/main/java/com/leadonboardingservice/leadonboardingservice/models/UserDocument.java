package com.leadonboardingservice.leadonboardingservice.models;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="tbl_user_documents")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class UserDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String iamUuid;
    private Long userId;
    private String docId;
    private String documentType;
    //private Integer dirId;
    private String fileName;
    private String filePath;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
