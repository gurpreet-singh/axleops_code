package com.fleetmanagement.service;

import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.request.CreateCompanyRequest;
import com.fleetmanagement.dto.response.CompanyResponse;
import com.fleetmanagement.entity.Company;
import com.fleetmanagement.mapper.CompanyMapper;
import com.fleetmanagement.repository.CompanyRepository;
import com.fleetmanagement.repository.LedgerAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final LedgerAccountRepository ledgerAccountRepository;
    private final CompanyMapper mapper;

    public List<CompanyResponse> getAll() {
        UUID tenantId = TenantContext.get();
        return companyRepository.findByTenantId(tenantId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public CompanyResponse getById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found: " + id));
        return mapper.toResponse(company);
    }

    @Transactional
    public CompanyResponse create(CreateCompanyRequest req) {
        UUID tenantId = TenantContext.get();

        Company company = new Company();
        company.setTenantId(tenantId);
        company.setLegalName(req.getLegalName());
        company.setTradeName(req.getTradeName());
        company.setPanNumber(req.getPanNumber());
        company.setCinNumber(req.getCinNumber());
        company.setCompanyType(Company.CompanyType.valueOf(req.getCompanyType()));
        company.setDefaultPaymentTerms(req.getDefaultPaymentTerms());
        company.setOurVendorCode(req.getOurVendorCode());
        company.setLastYearRevenue(req.getLastYearRevenue());
        company.setWebsite(req.getWebsite());
        company.setGstRegistered(req.isGstRegistered());
        company.setFuelVendor(req.isFuelVendor());
        company.setGstins(req.getGstins());

        Company saved = companyRepository.save(company);
        return mapper.toResponse(saved);
    }

    /**
     * Update company master data and cascade denormalised fields to all LedgerAccounts.
     * This is a rare operation (1-2 times/year per company) that eliminates
     * constant read-time join costs for every transaction.
     */
    @Transactional
    public CompanyResponse update(UUID id, CreateCompanyRequest req) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found: " + id));

        String oldLegalName = company.getLegalName();
        String oldPanNumber = company.getPanNumber();

        company.setLegalName(req.getLegalName());
        company.setTradeName(req.getTradeName());
        company.setPanNumber(req.getPanNumber());
        company.setCinNumber(req.getCinNumber());
        company.setCompanyType(Company.CompanyType.valueOf(req.getCompanyType()));
        company.setDefaultPaymentTerms(req.getDefaultPaymentTerms());
        company.setOurVendorCode(req.getOurVendorCode());
        company.setLastYearRevenue(req.getLastYearRevenue());
        company.setWebsite(req.getWebsite());
        company.setGstRegistered(req.isGstRegistered());
        company.setFuelVendor(req.isFuelVendor());
        company.setGstins(req.getGstins());

        Company saved = companyRepository.save(company);

        // CASCADE: propagate denormalised fields to all LedgerAccount rows
        boolean legalNameChanged = !req.getLegalName().equals(oldLegalName);
        boolean panChanged = (req.getPanNumber() == null && oldPanNumber != null)
                || (req.getPanNumber() != null && !req.getPanNumber().equals(oldPanNumber));

        if (legalNameChanged || panChanged) {
            int updated = ledgerAccountRepository.cascadeCompanyUpdate(
                    id, req.getLegalName(), req.getPanNumber());
            // Log: "Cascaded update to {updated} ledger accounts for company {id}"
        }

        return mapper.toResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        companyRepository.deleteById(id);
    }
}
