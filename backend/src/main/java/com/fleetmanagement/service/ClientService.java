package com.fleetmanagement.service;

import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.response.ClientResponse;
import com.fleetmanagement.dto.response.InvoiceResponse;
import com.fleetmanagement.mapper.ClientMapper;
import com.fleetmanagement.mapper.InvoiceMapper;
import com.fleetmanagement.repository.ClientRepository;
import com.fleetmanagement.repository.InvoiceRepository;
import com.fleetmanagement.config.BranchSecurityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClientService {

    private final ClientRepository clientRepository;
    private final InvoiceRepository invoiceRepository;
    private final ClientMapper clientMapper;
    private final InvoiceMapper invoiceMapper;

    public List<ClientResponse> getAllClients() {
        UUID tenantId = TenantContext.get();
        return clientRepository.findByTenantId(tenantId).stream()
                .map(clientMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<InvoiceResponse> getAllInvoices() {
        List<UUID> branchIds = BranchSecurityContext.get();
        if (branchIds == null || branchIds.isEmpty()) {
            branchIds = null;
        }

        UUID tenantId = TenantContext.get();
        return invoiceRepository.findAllScoped(tenantId, branchIds).stream()
                .map(invoiceMapper::toResponse)
                .collect(Collectors.toList());
    }
}