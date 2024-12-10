package com.leadonboardingservice.leadonboardingservice.models;

import com.leadonboardingservice.leadonboardingservice.annotations.event.Event;
import com.leadonboardingservice.leadonboardingservice.annotations.event.EventType;
import com.leadonboardingservice.leadonboardingservice.annotations.event.Events;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentSources;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentStatus;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import lombok.*;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.time.LocalDateTime;

@Table(name = "lead_document")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Where(clause = "is_deleted = false")
public class Document extends BaseEntity  implements IAuditLog{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private DocumentType type;

    @Enumerated(EnumType.STRING)
    private DocumentSources source;

    private String documentId;

    @Events(event = {
            @Event(name = "UPLOADED", type = EventType.CREATE)
    }, prefixField = "type")
    @Enumerated(EnumType.STRING)
    private DocumentStatus status;

    private Boolean isReUploaded;

    private LocalDateTime verifiedAt;

    private Integer rejectStatusRemarkId;

    private String url;

    @Transient
    private String tempDocUrl;

    private String origin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="lead_id", nullable=false)
    private Lead lead;

    @Override
    public String toString() {
        return "Document{" +
                "id=" + id +
                ", type=" + type +
                ", source=" + source +
                ", documentId='" + documentId + '\'' +
                ", status=" + status +
                ", verifiedAt=" + verifiedAt +
                ", rejectStatusRemarkId=" + rejectStatusRemarkId +
                '}';
    }
}
