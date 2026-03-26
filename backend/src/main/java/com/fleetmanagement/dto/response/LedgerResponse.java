package com.fleetmanagement.dto.response;

import lombok.Data;
import java.util.UUID;

@Data
public class LedgerResponse {
    private UUID id;
    private String code;
    private String name;
    private String tallyGroup;
    private String normalBalance;
}