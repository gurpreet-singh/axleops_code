package com.fleetmanagement.service;

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
        return purchaseOrderRepository.findAll().stream()
                .map(purchaseOrderMapper::toResponse)
                .toList();
    }

    public PurchaseOrderResponse getPurchaseOrderById(UUID id) {
        return purchaseOrderRepository.findById(id)
                .map(purchaseOrderMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("PurchaseOrder not found: " + id));
    }
}
