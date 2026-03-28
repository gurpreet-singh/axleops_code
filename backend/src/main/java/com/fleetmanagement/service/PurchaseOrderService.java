package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.response.PurchaseOrderResponse;
import com.fleetmanagement.mapper.PurchaseOrderMapper;
import com.fleetmanagement.repository.PurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderMapper purchaseOrderMapper;

    public List<PurchaseOrderResponse> getAllPurchaseOrders() {
        UUID tenantId = TenantContext.get();
        return purchaseOrderRepository.findByTenantId(tenantId).stream()
                .map(purchaseOrderMapper::toResponse)
                .toList();
    }

    public PurchaseOrderResponse getPurchaseOrderById(UUID id) {
        UUID tenantId = TenantContext.get();
        return purchaseOrderRepository.findByIdAndTenantId(id, tenantId)
                .map(purchaseOrderMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));
    }
}
