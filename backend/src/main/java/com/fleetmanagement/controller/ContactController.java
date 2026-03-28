package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.dto.response.ContactResponse;
import com.fleetmanagement.entity.Authority;
import com.fleetmanagement.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    @RequiresAuthority(Authority.ORG_READ)
    public ResponseEntity<List<ContactResponse>> getAllContacts(
            @RequestParam(required = false) String type) {
        if ("Driver".equalsIgnoreCase(type) || "DRIVER".equals(type)) {
            return ResponseEntity.ok(contactService.getDrivers());
        }
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    @GetMapping("/{id}")
    @RequiresAuthority(Authority.ORG_READ)
    public ResponseEntity<ContactResponse> getContactById(@PathVariable UUID id) {
        return ResponseEntity.ok(contactService.getContactById(id));
    }
}
