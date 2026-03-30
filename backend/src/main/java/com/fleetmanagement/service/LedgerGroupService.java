package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.response.LedgerGroupResponse;
import com.fleetmanagement.entity.LedgerGroupType;
import com.fleetmanagement.entity.LedgerGroup;
import com.fleetmanagement.mapper.LedgerGroupMapper;
import com.fleetmanagement.repository.LedgerGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LedgerGroupService {

    private final LedgerGroupRepository repository;
    private final LedgerGroupMapper mapper;

    public List<LedgerGroupResponse> getAll() {
        UUID tenantId = TenantContext.get();
        return repository.findByTenantId(tenantId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public LedgerGroupResponse getById(UUID id) {
        UUID tenantId = TenantContext.get();
        LedgerGroup group = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("LedgerGroup", id));
        return mapper.toResponse(group);
    }

    @Transactional
    public LedgerGroupResponse create(Map<String, Object> req) {
        UUID tenantId = TenantContext.get();
        String name = (String) req.get("name");

        // Validate uniqueness of group name within tenant
        repository.findByNameIgnoreCaseAndTenantId(name, tenantId)
                .ifPresent(g -> {
                    throw new IllegalArgumentException(
                            "Ledger group with name '" + name + "' already exists");
                });

        LedgerGroup group = new LedgerGroup();
        group.setTenantId(tenantId);
        group.setName(name);
        group.setNature(LedgerGroup.GroupNature.valueOf((String) req.get("nature")));

        String groupType = (String) req.get("groupType");
        if (groupType != null && !groupType.isEmpty()) {
            group.setGroupType(LedgerGroupType.valueOf(groupType));
        }

        String tallyGroupName = (String) req.get("tallyGroupName");
        group.setTallyGroupName(tallyGroupName);

        String parentGroupId = (String) req.get("parentGroupId");
        if (parentGroupId != null && !parentGroupId.isEmpty()) {
            LedgerGroup parent = repository.findByIdAndTenantId(UUID.fromString(parentGroupId), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent LedgerGroup", parentGroupId));
            group.setParentGroup(parent);
        }

        LedgerGroup saved = repository.save(group);
        return mapper.toResponse(saved);
    }

    @Transactional
    public LedgerGroupResponse update(UUID id, Map<String, Object> req) {
        UUID tenantId = TenantContext.get();
        LedgerGroup group = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("LedgerGroup", id));

        String name = (String) req.get("name");
        // If name is changing, validate uniqueness
        if (name != null && !name.equalsIgnoreCase(group.getName())) {
            repository.findByNameIgnoreCaseAndTenantId(name, tenantId)
                    .ifPresent(g -> {
                        throw new IllegalArgumentException(
                                "Ledger group with name '" + name + "' already exists");
                    });
        }

        group.setName(name);
        group.setNature(LedgerGroup.GroupNature.valueOf((String) req.get("nature")));

        String groupType = (String) req.get("groupType");
        if (groupType != null && !groupType.isEmpty()) {
            group.setGroupType(LedgerGroupType.valueOf(groupType));
        } else {
            group.setGroupType(null);
        }

        group.setTallyGroupName((String) req.get("tallyGroupName"));

        String parentGroupId = (String) req.get("parentGroupId");
        if (parentGroupId != null && !parentGroupId.isEmpty()) {
            LedgerGroup parent = repository.findByIdAndTenantId(UUID.fromString(parentGroupId), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent LedgerGroup", parentGroupId));
            group.setParentGroup(parent);
        } else {
            group.setParentGroup(null);
        }

        LedgerGroup saved = repository.save(group);
        return mapper.toResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        UUID tenantId = TenantContext.get();
        LedgerGroup group = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("LedgerGroup", id));
        repository.delete(group);
    }
}
