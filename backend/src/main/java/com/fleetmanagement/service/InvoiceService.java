package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
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
        UUID tenantId = TenantContext.get();
        return invoiceRepository.findAllScoped(tenantId, null).stream()
                .map(invoiceMapper::toResponse)
                .toList();
    }

    public InvoiceResponse getInvoiceById(UUID id) {
        UUID tenantId = TenantContext.get();
        return invoiceRepository.findByIdAndTenantId(id, tenantId)
                .map(invoiceMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
    }
}
