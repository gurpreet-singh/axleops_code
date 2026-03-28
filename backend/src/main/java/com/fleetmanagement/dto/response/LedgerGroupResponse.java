package com.fleetmanagement.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class LedgerGroupResponse {
    private UUID id;
    private String name;
    private String nature;
    private String defaultAccountType;
    private UUID parentGroupId;
    private String tallyGroupName;
    private boolean systemGroup;
}
