package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Tracks uploaded documents/files associated with a vehicle.
 * Different from ComplianceDocument — this is for arbitrary files.
 */
@Entity
@Table(name = "vehicle_documents")
@Getter
@Setter
public class VehicleDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private String name;

    @Column(name = "document_category")
    private String documentCategory; // PHOTO, INVOICE, RECEIPT, RC_COPY, INSURANCE_COPY, OTHER

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_type")
    private String fileType; // pdf, jpg, png, etc.

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl; // S3 / local path

    @Column(name = "upload_date")
    private LocalDate uploadDate;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
