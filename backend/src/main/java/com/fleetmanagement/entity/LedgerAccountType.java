package com.fleetmanagement.entity;

/**
 * Classifies every ledger account by its operational behaviour.
 * <p>
 * Each value drives specific form fields, dropdown eligibility, and
 * reconciliation/validation logic. Sub-classification (e.g. OEM vs
 * logistics client, tyre vs electrical vendor) is handled by the
 * LedgerGroup name — not by this enum.
 *
 * <pre>
 * CLIENT                 — anyone you bill freight to
 * VENDOR                 — anyone you pay for goods/services
 * FUEL_PUMP              — fuel purchase with pump-specific logic (rate/litre, KMPL, GPS match)
 * BANK_ACCOUNT           — savings, current, OD — bank recon, IFSC/account fields
 * CASH_ACCOUNT           — physical cash, petty cash
 * FUEL_CARD              — BPCL Smart Card, IOC XtraRewards — per-driver, card-level recon
 * FASTAG_ACCOUNT         — toll wallet, auto-imported, matched to trips
 * CORPORATE_EXPENSE_CARD — Happay, HDFC Happy Card — per-person non-fuel expense cards
 * TAX_DUTY               — GST, TDS, TCS — tax type/rate fields, tax config dropdowns
 * CAPITAL_ACCOUNT        — owner equity, partner capital, drawings
 * INTERNAL_TRANSFER      — contra entries between own bank/cash accounts
 * EXPENSE                — toll, loading, repair, rent, salary, admin — general expense heads
 * INCOME                 — freight income, scrap sales, misc income — revenue heads
 * FIXED_ASSET            — vehicles, furniture, equipment — depreciation, asset tracking
 * </pre>
 */
public enum LedgerAccountType {

    // ── Party Accounts ───────────────────────────────────────
    CLIENT,
    VENDOR,
    FUEL_PUMP,

    // ── Financial Accounts ───────────────────────────────────
    BANK_ACCOUNT,
    CASH_ACCOUNT,
    FUEL_CARD,
    FASTAG_ACCOUNT,
    CORPORATE_EXPENSE_CARD,

    // ── Statutory ────────────────────────────────────────────
    TAX_DUTY,
    CAPITAL_ACCOUNT,
    INTERNAL_TRANSFER,

    // ── P&L Heads ────────────────────────────────────────────
    EXPENSE,
    INCOME,
    FIXED_ASSET
}
