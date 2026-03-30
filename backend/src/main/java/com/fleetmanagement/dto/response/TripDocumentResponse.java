package com.fleetmanagement.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TripDocumentResponse {
    private UUID id;
    private UUID tripId;
    private String documentType;
    private String documentNumber;
    private String status;
    private String fileUrl;
    private String fileName;
    private String mimeType;
    private LocalDateTime uploadedAt;
    private UUID uploadedBy;
    private LocalDateTime verifiedAt;
    private UUID verifiedBy;
    private String rejectionReason;
    private String notes;
}
