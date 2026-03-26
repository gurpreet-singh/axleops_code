package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ClientResponse {
    private UUID id;
    private String name;
    private String tradeName;
    private String gstin;
    private String pan;
    private String address;
    private String city;
    private String state;
    private String phone;
    private String email;
    private String billingType;
    private String industry;
    private String contractType;
    private String rate;
    private BigDecimal creditLimit;
    private String status;
}