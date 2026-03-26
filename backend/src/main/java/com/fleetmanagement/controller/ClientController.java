package com.fleetmanagement.controller;

import com.fleetmanagement.dto.response.ClientResponse;
import com.fleetmanagement.dto.response.InvoiceResponse;
import com.fleetmanagement.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAllClients() {
        return ResponseEntity.ok(clientService.getAllClients());
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        return ResponseEntity.ok(clientService.getAllInvoices());
    }
}