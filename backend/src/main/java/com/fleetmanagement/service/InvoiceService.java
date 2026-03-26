package com.fleetmanagement.service;

import com.fleetmanagement.dto.response.InvoiceResponse;
import com.fleetmanagement.mapper.InvoiceMapper;
import com.fleetmanagement.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceMapper invoiceMapper;

    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(invoiceMapper::toResponse)
                .toList();
    }

    public InvoiceResponse getInvoiceById(UUID id) {
        return invoiceRepository.findById(id)
                .map(invoiceMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
    }
}
