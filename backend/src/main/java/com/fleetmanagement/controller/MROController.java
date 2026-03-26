package com.fleetmanagement.controller;

import com.fleetmanagement.dto.response.WorkOrderResponse;
import com.fleetmanagement.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/mro")
@RequiredArgsConstructor
public class MROController {

    private final WorkOrderService workOrderService;

    @GetMapping("/work-orders")
    public ResponseEntity<List<WorkOrderResponse>> getAllWorkOrders() {
        return ResponseEntity.ok(workOrderService.getAllWorkOrders());
    }
}