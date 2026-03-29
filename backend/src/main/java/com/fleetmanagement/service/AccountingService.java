package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.response.LedgerAccountResponse;
import com.fleetmanagement.dto.request.CreateVoucherRequest;
import com.fleetmanagement.dto.response.VoucherResponse;
import com.fleetmanagement.dto.response.ProfitLossResponse;
import com.fleetmanagement.entity.LedgerAccount;
import com.fleetmanagement.entity.Voucher;
import com.fleetmanagement.entity.Branch;
import com.fleetmanagement.entity.Trip;
import com.fleetmanagement.mapper.LedgerAccountMapper;
import com.fleetmanagement.mapper.VoucherMapper;
import com.fleetmanagement.repository.LedgerAccountRepository;
import com.fleetmanagement.repository.VoucherRepository;
import com.fleetmanagement.repository.BranchRepository;
import com.fleetmanagement.repository.TripRepository;
import com.fleetmanagement.config.BranchSecurityContext;
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
public class AccountingService {

    private final LedgerAccountRepository ledgerAccountRepository;
    private final VoucherRepository voucherRepository;
    private final BranchRepository branchRepository;
    private final TripRepository tripRepository;
    private final LedgerAccountMapper ledgerAccountMapper;
    private final VoucherMapper voucherMapper;

    public List<LedgerAccountResponse> getAllLedgers() {
        UUID tenantId = TenantContext.get();
        return ledgerAccountRepository.findByTenantId(tenantId).stream()
                .map(ledgerAccountMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VoucherResponse createVoucher(CreateVoucherRequest req) {
        UUID tenantId = TenantContext.get();

        // Verify debit/credit ledger accounts belong to this tenant
        LedgerAccount dr = ledgerAccountRepository.findByIdAndTenantId(req.getDebitLedgerId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Debit LedgerAccount", req.getDebitLedgerId()));
        LedgerAccount cr = ledgerAccountRepository.findByIdAndTenantId(req.getCreditLedgerId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit LedgerAccount", req.getCreditLedgerId()));

        Voucher voucher = new Voucher();
        voucher.setTenantId(tenantId);
        voucher.setVoucherNumber("VCH-" + System.currentTimeMillis());
        voucher.setType(req.getType());
        voucher.setDate(req.getDate());
        voucher.setDebitLedger(dr);
        voucher.setCreditLedger(cr);
        voucher.setAmount(req.getAmount());
        voucher.setNarration(req.getNarration());

        // Verify branch belongs to this tenant
        if (req.getBranchId() != null) {
            Branch branch = branchRepository.findByTenantId(tenantId).stream()
                    .filter(b -> b.getId().equals(req.getBranchId()))
                    .findFirst()
                    .orElse(null);
            voucher.setBranch(branch);
        }

        // Verify trip belongs to this tenant
        if (req.getTripId() != null) {
            Trip trip = tripRepository.findByIdAndTenantId(req.getTripId(), tenantId)
                    .orElse(null);
            voucher.setTrip(trip);
        }

        Voucher saved = voucherRepository.save(voucher);
        return voucherMapper.toResponse(saved);
    }

    public List<VoucherResponse> getAllVouchers() {
        List<UUID> branchIds = BranchSecurityContext.get();
        if (branchIds == null || branchIds.isEmpty()) branchIds = null;

        UUID tenantId = TenantContext.get();
        return voucherRepository.findAllScoped(tenantId, branchIds).stream()
                .map(voucherMapper::toResponse)
                .collect(Collectors.toList());
    }

    public ProfitLossResponse getProfitLoss() {
        // TODO: Replace hardcoded P&L values with real voucher aggregation:
        // List<UUID> branchIds = BranchSecurityContext.get();
        // if (branchIds == null || branchIds.isEmpty()) branchIds = null;
        // UUID tenantId = TenantContext.get();
        // List<VoucherResponse> vouchers = voucherRepository.findAllScoped(tenantId, branchIds)
        //         .stream().map(voucherMapper::toResponse).collect(Collectors.toList());

        // Very simplified P&L aggregation based on Tally Groups
        // In a real app we would join on ledgers and aggregate properly via SQL
        // This simulates the behavior for the demo.
        ProfitLossResponse pl = new ProfitLossResponse();
        pl.setDirectIncome(new BigDecimal("1845200"));
        pl.setIndirectIncome(new BigDecimal("12700"));
        pl.setDirectExpenses(new BigDecimal("1255200"));
        pl.setIndirectExpenses(new BigDecimal("429600"));

        BigDecimal totalIncome = pl.getDirectIncome().add(pl.getIndirectIncome());
        BigDecimal totalExpense = pl.getDirectExpenses().add(pl.getIndirectExpenses());
        pl.setNetProfit(totalIncome.subtract(totalExpense));

        return pl;
    }
}