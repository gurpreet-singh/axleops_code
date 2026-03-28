package com.fleetmanagement.csvimport.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldError {
    private String fieldName;
    private String value;
    private String errorCode;
    private String message;
}
