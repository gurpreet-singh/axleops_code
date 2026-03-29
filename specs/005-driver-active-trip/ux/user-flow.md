# User Flow — Driver Active Trip

> **Feature**: 005-driver-active-trip  
> **Date**: 2026-03-29

---

## 1. Primary Flow — Happy Path (Dispatched → POD Submitted)

```mermaid
flowchart TD
    A[Driver opens app] --> B{Active trip exists?}
    B -- No --> C[Empty State: 'No active trip']
    B -- Yes --> D{Trip sub-state?}
    
    D -- DISPATCHED --> E[Trip Card + Accept / Reject]
    E -- Accept --> F[Confirm Modal: 'Accept this trip?']
    F -- Confirm --> G[API: accept → ACCEPTED]
    F -- Cancel --> E
    E -- Reject --> H[Reject Modal: reason required]
    H -- Confirm --> I[API: reject → DRIVER_REJECTED → Empty State]
    
    G --> J[Trip Card: ACCEPTED + CTA 'Arrived at Origin']
    J -- Tap CTA --> K[Capture GPS → AT_ORIGIN]
    K --> L[CTA 'Start Loading']
    L -- Tap CTA --> M[LOADING]
    M --> N[Loading Complete Form: weight, seal, photos]
    N -- Submit --> O[LOADED + CTA 'Depart']
    
    O --> P{EWB required?}
    P -- No --> Q[Depart → DEPARTED]
    P -- Yes, ready --> Q
    P -- Yes, not ready --> R[Blocked: 'Awaiting E-Way Bill']
    R -- EWB ready --> Q
    
    Q --> S[GPS Tracking Starts + IN_TRANSIT]
    S --> T[En-route: log events, expenses, documents]
    T --> U[CTA 'Arrived at Destination']
    U -- Tap CTA --> V[Capture GPS + odometer → AT_DESTINATION]
    
    V --> W[CTA 'Start Unloading']
    W -- Tap CTA --> X[UNLOADING]
    X --> Y[Delivery Complete Form: weight, condition]
    Y -- Submit --> Z[DELIVERED + CTA 'Submit POD']
    
    Z --> AA[POD Capture Flow]
    AA --> AB[Photos + Signature + Consignee]
    AB --> AC[Review & Submit POD]
    AC -- Submit --> AD[POD_SUBMITTED → Read-only]
```

---

## 2. Accept Timeout Flow

```mermaid
flowchart TD
    A[DISPATCHED trip shown] --> B{Within 30 min of dispatch?}
    B -- Yes --> C[Accept / Reject enabled]
    B -- No --> D[Accept disabled + message: 'Trip can no longer be accepted. Contact dispatch.']
    D --> E[Reject still available]
```

---

## 3. Exception Flow

```mermaid
flowchart TD
    A[IN_TRANSIT or AT_DESTINATION] --> B[Driver taps 'Report Issue']
    B --> C[Exception type sheet: Breakdown / Accident / Cargo Damage / Shortage / Route Blocked]
    C --> D[Exception form: description + GPS auto + photos optional]
    D -- Submit --> E[API: report exception]
    E --> F[Exception banner shown on trip detail]
    F --> G[Normal actions DISABLED]
    G --> H{Resolved by Ops?}
    H -- Yes --> I[Banner clears, milestone resumes]
    H -- No --> G
```

---

## 4. POD Capture Flow (Multi-Step, Tabs Hidden)

```mermaid
flowchart TD
    A[DELIVERED state → CTA 'Submit POD'] --> B[POD Flow starts — tabs hidden]
    B --> C[Step 1: Capture Photos — camera/gallery — min 2]
    C --> D{Min photos met?}
    D -- No --> C
    D -- Yes --> E[Step 2: Signature Capture — digital drawing pad]
    E --> F[Step 3: Consignee Info — name required, designation, remarks]
    F --> G{POD type?}
    G -- Normal --> H[Step 4: Review — all data summary]
    G -- Refused --> I[Refusal reason required]
    I --> H
    H -- Submit --> J[Upload in progress — per-file progress]
    J -- Success --> K[Pop to trip detail — POD_SUBMITTED]
    J -- Partial failure --> L[Retry failed files — don't re-capture]
    
    subgraph Exit
        M[Back / Close on any step] --> N{Data captured?}
        N -- Yes --> O[Confirm: 'Discard POD data?']
        N -- No --> P[Exit to trip detail]
    end
```

---

## 5. Document Upload Flow

```mermaid
flowchart TD
    A[Trip detail → Documents section] --> B{Documents exist?}
    B -- No --> C[Empty: 'No documents yet']
    B -- Yes --> D[Document list with thumbnails + status]
    
    A --> E[Tap 'Add Document']
    E --> F[Category sheet: Invoice / Weighbridge / Permit / Cargo Photo / Receipt / Other]
    F --> G[Camera capture or gallery pick]
    G --> H{Upload succeeds?}
    H -- Yes --> I[Document in list with ✓]
    H -- No (network) --> J[Document in list with ⏳ 'Pending' + Retry]
    H -- No (error) --> K[Document in list with ❌ + Retry]
    
    D --> L[Tap document → Full-screen viewer — photos: pinch-zoom; PDFs: in-app]
```

---

## 6. Expense Logging Flow

```mermaid
flowchart TD
    A[Trip detail → Expenses section] --> B{Expenses exist?}
    B -- No --> C[Empty: 'No expenses logged']
    B -- Yes --> D[Expense list + running total]
    
    A --> E[Tap 'Add Expense']
    E --> F[Category sheet: Fuel / Toll / Food / Loading / Maintenance / Misc]
    F --> G{Fuel selected?}
    G -- Yes --> H[Fuel form: litres, price/litre, auto-total, odometer]
    G -- No --> I[Standard form: amount, description, receipt photo]
    H --> J[Submit → saved locally → sync]
    I --> J
    J -- Online --> K[Synced ✓ in list]
    J -- Offline --> L[Pending sync ⏳ in list]
```

---

## 7. Offline Flow

```mermaid
flowchart TD
    A[Driver performing action] --> B{Network available?}
    B -- Yes --> C[API call → server response → UI updates]
    B -- No --> D[Action queued locally]
    D --> E[Offline banner visible]
    D --> F[Queued indicator: '1 pending update']
    E --> G{Network restored?}
    G -- Yes --> H[Queue drains → API calls sent]
    H --> I{Server accepts?}
    I -- Yes --> J[UI confirms sync ✓]
    I -- No (conflict) --> K[Refresh from server + notify driver of discrepancy]
    G -- No --> E
```

---

## 8. GPS Tracking Flow

```mermaid
flowchart TD
    A[Trip transitions to DEPARTED] --> B{GPS permission granted?}
    B -- Yes --> C[Start tracking — 5 min interval]
    B -- No --> D[Show warning: 'Enable location for tracking']
    D --> E[Trip proceeds without GPS — not blocked]
    
    C --> F[App in foreground: track + log]
    C --> G[App in background: foreground service Android / BG location iOS]
    C --> H[App killed: START_STICKY Android / significant location iOS]
    
    F --> I{AT_DESTINATION reached?}
    G --> I
    H --> I
    I -- Yes --> J[Stop tracking, dismiss notification]
    
    C --> K{Network available?}
    K -- Yes --> L[Send batch to API]
    K -- No --> M[Store locally, send next batch]
```
