package com.fleetmanagement.controller;

import com.fleetmanagement.dto.response.WorkOrderResponse;
import com.fleetmanagement.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping
    public ResponseEntity<List<WorkOrderResponse>> getAllWorkOrders() {
        return ResponseEntity.ok(workOrderService.getAllWorkOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderResponse> getWorkOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }
}
