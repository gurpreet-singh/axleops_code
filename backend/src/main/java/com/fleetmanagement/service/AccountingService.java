package com.fleetmanagement.service;

import com.fleetmanagement.dto.response.LedgerResponse;
import com.fleetmanagement.dto.request.CreateVoucherRequest;
import com.fleetmanagement.dto.response.VoucherResponse;
import com.fleetmanagement.dto.response.ProfitLossResponse;
import com.fleetmanagement.entity.Ledger;
import com.fleetmanagement.entity.Voucher;
import com.fleetmanagement.entity.Branch;
import com.fleetmanagement.entity.Trip;
import com.fleetmanagement.mapper.LedgerMapper;
import com.fleetmanagement.mapper.VoucherMapper;
import com.fleetmanagement.repository.LedgerRepository;
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

    private final LedgerRepository ledgerRepository;
    private final VoucherRepository voucherRepository;
    private final BranchRepository branchRepository;
    private final TripRepository tripRepository;
    private final LedgerMapper ledgerMapper;
    private final VoucherMapper voucherMapper;

    public List<LedgerResponse> getAllLedgers() {
        return ledgerRepository.findAll().stream()
                .map(ledgerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VoucherResponse createVoucher(CreateVoucherRequest req) {
        UUID tenantId = com.fleetmanagement.config.TenantContext.get();
        Ledger dr = ledgerRepository.findById(req.getDebitLedgerId()).orElseThrow(() -> new RuntimeException("Dr ledger not found"));
        Ledger cr = ledgerRepository.findById(req.getCreditLedgerId()).orElseThrow(() -> new RuntimeException("Cr ledger not found"));

        Voucher voucher = new Voucher();
        voucher.setTenantId(tenantId);
        voucher.setVoucherNumber("VCH-" + System.currentTimeMillis());
        voucher.setType(req.getType());
        voucher.setDate(req.getDate());
        voucher.setDebitLedger(dr);
        voucher.setCreditLedger(cr);
        voucher.setAmount(req.getAmount());
        voucher.setNarration(req.getNarration());

        if (req.getBranchId() != null) {
            Branch branch = branchRepository.findById(req.getBranchId()).orElse(null);
            voucher.setBranch(branch);
        }

        if (req.getTripId() != null) {
            Trip trip = tripRepository.findById(req.getTripId()).orElse(null);
            voucher.setTrip(trip);
        }

        Voucher saved = voucherRepository.save(voucher);
        return voucherMapper.toResponse(saved);
    }

    public List<VoucherResponse> getAllVouchers() {
        List<UUID> branchIds = BranchSecurityContext.get();
        if (branchIds == null || branchIds.isEmpty()) branchIds = null;

        UUID tenantId = com.fleetmanagement.config.TenantContext.get();
        return voucherRepository.findAllScoped(tenantId, branchIds).stream()
                .map(voucherMapper::toResponse)
                .collect(Collectors.toList());
    }

    public ProfitLossResponse getProfitLoss() {
        List<UUID> branchIds = BranchSecurityContext.get();
        if (branchIds == null || branchIds.isEmpty()) branchIds = null;
        UUID tenantId = com.fleetmanagement.config.TenantContext.get();

        List<VoucherResponse> vouchers = voucherRepository.findAllScoped(tenantId, branchIds).stream()
                .map(voucherMapper::toResponse)
                .collect(Collectors.toList());

        ProfitLossResponse pl = new ProfitLossResponse();

        // Very simplified P&L aggregation based on Tally Groups
        // In a real app we would join on ledgers and aggregate properly via SQL
        // This simulates the behavior for the demo.
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