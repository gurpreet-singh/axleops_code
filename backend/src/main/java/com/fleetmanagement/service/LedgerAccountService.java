package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.request.CreateLedgerAccountRequest;
import com.fleetmanagement.dto.response.LedgerAccountResponse;
import com.fleetmanagement.entity.LedgerGroup;
import com.fleetmanagement.entity.LedgerAccountType;
import com.fleetmanagement.entity.Company;
import com.fleetmanagement.entity.LedgerAccount;
import com.fleetmanagement.mapper.LedgerAccountMapper;
import com.fleetmanagement.repository.LedgerGroupRepository;
import com.fleetmanagement.repository.CompanyRepository;
import com.fleetmanagement.repository.LedgerAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LedgerAccountService {

    private final LedgerAccountRepository ledgerAccountRepository;
    private final LedgerGroupRepository ledgerGroupRepository;
    private final CompanyRepository companyRepository;
    private final LedgerAccountMapper mapper;

    public List<LedgerAccountResponse> getAll() {
        UUID tenantId = TenantContext.get();
        return ledgerAccountRepository.findByTenantId(tenantId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<LedgerAccountResponse> getActive() {
        UUID tenantId = TenantContext.get();
        return ledgerAccountRepository.findByTenantIdAndActiveTrue(tenantId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public LedgerAccountResponse getById(UUID id) {
        UUID tenantId = TenantContext.get();
        LedgerAccount account = ledgerAccountRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("LedgerAccount", id));
        return mapper.toResponse(account);
    }

    public List<LedgerAccountResponse> getByCompany(UUID companyId) {
        // Verify the company belongs to this tenant first
        UUID tenantId = TenantContext.get();
        companyRepository.findByIdAndTenantId(companyId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", companyId));
        return ledgerAccountRepository.findByCompanyIdAndTenantId(companyId, tenantId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LedgerAccountResponse create(CreateLedgerAccountRequest req) {
        UUID tenantId = TenantContext.get();

        LedgerGroup group = ledgerGroupRepository.findByIdAndTenantId(req.getAccountGroupId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("LedgerGroup", req.getAccountGroupId()));

        LedgerAccount account = new LedgerAccount();
        account.setTenantId(tenantId);

        // Identity — denormalise group name and nature
        account.setAccountHead(req.getAccountHead());
        account.setTallyName(req.getTallyName());
        account.setNameOnDashboard(req.getNameOnDashboard());
        account.setPrintName(req.getPrintName());
        account.setAccountGroupRef(group);
        // accountType — persisted directly, selected by user
        if (req.getAccountType() != null && !req.getAccountType().isEmpty()) {
            account.setAccountType(LedgerAccountType.valueOf(req.getAccountType()));
        }

        // Financials
        account.setOpeningBalance(req.getOpeningBalance() != null ? req.getOpeningBalance() : BigDecimal.ZERO);
        account.setCurrentBalance(account.getOpeningBalance());
        account.setCurrency(req.getCurrency() != null ? req.getCurrency() : "INR");
        if (req.getDebitCredit() != null) {
            account.setDebitCredit(LedgerAccount.DebitCredit.valueOf(req.getDebitCredit()));
        }

        // Party data — denormalise from Company if provided
        if (req.getCompanyId() != null) {
            Company company = companyRepository.findByIdAndTenantId(req.getCompanyId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Company", req.getCompanyId()));
            account.setCompany(company);
            // Denormalise from company master
            account.setPanNumber(req.getPanNumber() != null ? req.getPanNumber() : company.getPanNumber());
            account.setLegalName(req.getLegalName() != null ? req.getLegalName() : company.getLegalName());
            account.setOurVendorCode(req.getOurVendorCode() != null ? req.getOurVendorCode() : company.getOurVendorCode());
        } else {
            account.setPanNumber(req.getPanNumber());
            account.setLegalName(req.getLegalName());
            account.setOurVendorCode(req.getOurVendorCode());
        }

        account.setGstin(req.getGstin());
        if (req.getTcsApplicable() != null) {
            account.setTcsApplicable(LedgerAccount.TcsApplicability.valueOf(req.getTcsApplicable()));
        }
        account.setPaymentTerms(req.getPaymentTerms());
        account.setTallyPaymentTerms(req.getTallyPaymentTerms());

        // Address
        account.setBillingAddress(req.getBillingAddress());
        account.setCity(req.getCity());
        account.setState(req.getState());
        account.setStateCode(req.getStateCode());
        account.setCountry(req.getCountry());
        account.setPinCode(req.getPinCode());
        account.setPhone(req.getPhone());
        account.setMobile(req.getMobile());
        account.setEmail(req.getEmail());
        account.setContactPerson(req.getContactPerson());
        account.setDesignation(req.getDesignation());
        account.setWebsite(req.getWebsite());

        // Shipping
        account.setShippedToSameAsBilling(req.isShippedToSameAsBilling());
        account.setShippingAddress(req.getShippingAddress());
        account.setShippingCity(req.getShippingCity());
        account.setShippingState(req.getShippingState());
        account.setShippingStateCode(req.getShippingStateCode());
        account.setShippingCountry(req.getShippingCountry());
        account.setShippingPinCode(req.getShippingPinCode());
        account.setShippingPhone(req.getShippingPhone());
        account.setShippingMobile(req.getShippingMobile());
        account.setShippingEmail(req.getShippingEmail());
        account.setShippingContactPerson(req.getShippingContactPerson());
        account.setShippingDesignation(req.getShippingDesignation());

        // Other
        account.setCinNumber(req.getCinNumber());
        account.setDefaultShippedToCode(req.getDefaultShippedToCode());

        LedgerAccount saved = ledgerAccountRepository.save(account);
        return mapper.toResponse(saved);
    }

    @Transactional
    public LedgerAccountResponse update(UUID id, CreateLedgerAccountRequest req) {
        UUID tenantId = TenantContext.get();
        LedgerAccount account = ledgerAccountRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("LedgerAccount", id));

        account.setAccountHead(req.getAccountHead());
        account.setTallyName(req.getTallyName());
        account.setNameOnDashboard(req.getNameOnDashboard());
        account.setPrintName(req.getPrintName());

        if (req.getAccountGroupId() != null) {
            LedgerGroup group = ledgerGroupRepository.findByIdAndTenantId(req.getAccountGroupId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("LedgerGroup", req.getAccountGroupId()));
            account.setAccountGroupRef(group);
        }

        // accountType — update if provided
        if (req.getAccountType() != null && !req.getAccountType().isEmpty()) {
            account.setAccountType(LedgerAccountType.valueOf(req.getAccountType()));
        }

        account.setGstin(req.getGstin());
        account.setPanNumber(req.getPanNumber());
        account.setLegalName(req.getLegalName());
        account.setOurVendorCode(req.getOurVendorCode());
        if (req.getTcsApplicable() != null) {
            account.setTcsApplicable(LedgerAccount.TcsApplicability.valueOf(req.getTcsApplicable()));
        }
        if (req.getDebitCredit() != null) {
            account.setDebitCredit(LedgerAccount.DebitCredit.valueOf(req.getDebitCredit()));
        }
        account.setPaymentTerms(req.getPaymentTerms());
        account.setTallyPaymentTerms(req.getTallyPaymentTerms());

        // Address
        account.setBillingAddress(req.getBillingAddress());
        account.setCity(req.getCity());
        account.setState(req.getState());
        account.setStateCode(req.getStateCode());
        account.setCountry(req.getCountry());
        account.setPinCode(req.getPinCode());
        account.setPhone(req.getPhone());
        account.setMobile(req.getMobile());
        account.setEmail(req.getEmail());
        account.setContactPerson(req.getContactPerson());
        account.setDesignation(req.getDesignation());
        account.setWebsite(req.getWebsite());

        // Shipping
        account.setShippedToSameAsBilling(req.isShippedToSameAsBilling());
        account.setShippingAddress(req.getShippingAddress());
        account.setShippingCity(req.getShippingCity());
        account.setShippingState(req.getShippingState());
        account.setShippingStateCode(req.getShippingStateCode());
        account.setShippingCountry(req.getShippingCountry());
        account.setShippingPinCode(req.getShippingPinCode());
        account.setShippingPhone(req.getShippingPhone());
        account.setShippingMobile(req.getShippingMobile());
        account.setShippingEmail(req.getShippingEmail());
        account.setShippingContactPerson(req.getShippingContactPerson());
        account.setShippingDesignation(req.getShippingDesignation());

        // Other
        account.setCinNumber(req.getCinNumber());
        account.setDefaultShippedToCode(req.getDefaultShippedToCode());

        LedgerAccount saved = ledgerAccountRepository.save(account);
        return mapper.toResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        UUID tenantId = TenantContext.get();
        LedgerAccount account = ledgerAccountRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("LedgerAccount", id));
        ledgerAccountRepository.delete(account);
    }
}
