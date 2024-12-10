package com.leadonboardingservice.leadonboardingservice.models.oldleads;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;


@Entity(name = "tbl_lead_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OldLeadDoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_origin")
    private String source;

    @Column(name = "document_type")
    private String documentType;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "lead_id")
    private Long leadId;

    @Column(name = "status")
    private Integer documentStatus;

    @Column(name = "reason_id")
    private String reasonId;
}
