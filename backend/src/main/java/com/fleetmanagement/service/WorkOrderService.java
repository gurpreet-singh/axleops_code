package com.fleetmanagement.service;

import com.fleetmanagement.dto.response.WorkOrderResponse;
import com.fleetmanagement.mapper.WorkOrderMapper;
import com.fleetmanagement.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderMapper workOrderMapper;

    public List<WorkOrderResponse> getAllWorkOrders() {
        return workOrderRepository.findAll().stream()
                .map(workOrderMapper::toResponse)
                .collect(Collectors.toList());
    }

    public WorkOrderResponse getWorkOrderById(UUID id) {
        return workOrderRepository.findById(id)
                .map(workOrderMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("WorkOrder not found: " + id));
    }
}