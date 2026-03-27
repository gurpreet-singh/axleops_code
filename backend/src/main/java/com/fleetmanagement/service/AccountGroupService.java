package com.fleetmanagement.service;

import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.response.AccountGroupResponse;
import com.fleetmanagement.entity.AccountGroup;
import com.fleetmanagement.mapper.AccountGroupMapper;
import com.fleetmanagement.repository.AccountGroupRepository;
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
public class AccountGroupService {

    private final AccountGroupRepository repository;
    private final AccountGroupMapper mapper;

    public List<AccountGroupResponse> getAll() {
        UUID tenantId = TenantContext.get();
        return repository.findByTenantId(tenantId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public AccountGroupResponse getById(UUID id) {
        AccountGroup group = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("AccountGroup not found: " + id));
        return mapper.toResponse(group);
    }

    @Transactional
    public AccountGroupResponse create(Map<String, Object> req) {
        UUID tenantId = TenantContext.get();

        AccountGroup group = new AccountGroup();
        group.setTenantId(tenantId);
        group.setName((String) req.get("name"));
        group.setNature(AccountGroup.GroupNature.valueOf((String) req.get("nature")));

        String defaultAccountType = (String) req.get("defaultAccountType");
        if (defaultAccountType != null && !defaultAccountType.isEmpty()) {
            group.setDefaultAccountType(AccountGroup.AccountType.valueOf(defaultAccountType));
        }

        String tallyGroupName = (String) req.get("tallyGroupName");
        group.setTallyGroupName(tallyGroupName);

        String parentGroupId = (String) req.get("parentGroupId");
        if (parentGroupId != null && !parentGroupId.isEmpty()) {
            AccountGroup parent = repository.findById(UUID.fromString(parentGroupId))
                    .orElseThrow(() -> new RuntimeException("Parent group not found"));
            group.setParentGroup(parent);
        }

        Boolean systemGroup = (Boolean) req.get("systemGroup");
        group.setSystemGroup(systemGroup != null && systemGroup);

        AccountGroup saved = repository.save(group);
        return mapper.toResponse(saved);
    }

    @Transactional
    public AccountGroupResponse update(UUID id, Map<String, Object> req) {
        AccountGroup group = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("AccountGroup not found: " + id));

        group.setName((String) req.get("name"));
        group.setNature(AccountGroup.GroupNature.valueOf((String) req.get("nature")));

        String defaultAccountType = (String) req.get("defaultAccountType");
        if (defaultAccountType != null && !defaultAccountType.isEmpty()) {
            group.setDefaultAccountType(AccountGroup.AccountType.valueOf(defaultAccountType));
        } else {
            group.setDefaultAccountType(null);
        }

        group.setTallyGroupName((String) req.get("tallyGroupName"));

        String parentGroupId = (String) req.get("parentGroupId");
        if (parentGroupId != null && !parentGroupId.isEmpty()) {
            AccountGroup parent = repository.findById(UUID.fromString(parentGroupId))
                    .orElseThrow(() -> new RuntimeException("Parent group not found"));
            group.setParentGroup(parent);
        } else {
            group.setParentGroup(null);
        }

        Boolean systemGroup = (Boolean) req.get("systemGroup");
        group.setSystemGroup(systemGroup != null && systemGroup);

        AccountGroup saved = repository.save(group);
        return mapper.toResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}
