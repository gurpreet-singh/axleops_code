package com.fleetmanagement.entity;

/**
 * Classifies every ledger group into one of five broad categories.
 * <p>
 * Determines which UI form sections appear and what business logic applies
 * to accounts created under that group:
 * <ul>
 *   <li>PARTY — clients, vendors, brokers → PAN, GSTIN, addresses, payment terms, TCS</li>
 *   <li>BANK — savings, current, OD, loan accounts → bank name, account no, IFSC, branch</li>
 *   <li>CASH — physical cash, petty cash, fuel cards, driver wallets → minimal fields</li>
 *   <li>TAX — GST, TDS, TCS, statutory accounts → tax category fields</li>
 *   <li>GENERAL — expenses, income, provisions → no extra fields, just identity + balance</li>
 * </ul>
 */
public enum LedgerGroupType {
    PARTY,
    BANK,
    CASH,
    TAX,
    GENERAL
}
