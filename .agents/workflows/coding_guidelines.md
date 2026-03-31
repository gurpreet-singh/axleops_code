---
description: Coding guidelines and UI patterns for the AxleOps platform — MUST be read before implementing any feature
---

# AxleOps Coding Guidelines

> **IMPORTANT**: Read this file before implementing any feature. These patterns MUST be followed for consistency.

---

## 1. Database & Schema Management

### DDL Auto Update is ON
- `spring.jpa.hibernate.ddl-auto=update` is enabled in both default and postgres profiles
- **Do NOT create Flyway migration scripts for schema changes** — Hibernate auto-syncs entity changes to PostgreSQL on startup
- When adding/modifying entities, just update the Java `@Entity` class — schema updates automatically
- Existing migration files in `db/migration/` are **seed data only** (INSERT statements)
- Use `INSERT ... ON CONFLICT (id) DO NOTHING` for PostgreSQL-compatible idempotent inserts
- **Never use** H2-specific functions (`RANDOM_UUID()`, `MERGE INTO`)

### PostgreSQL is Primary
- Always develop against PostgreSQL: `SPRING_PROFILES_ACTIVE=postgres ./gradlew bootRun`
- H2 is for integration tests only

---

## 2. Right-Side Slider Panel Pattern (CRITICAL)

All slider-based views MUST follow the exact same structure. The SliderPanel provides
a **single dark gradient header** (title + optional subtitle + close button). Content
components must NOT render their own dark header — that is now handled by the panel.

There are two slider types:

### A. Detail Slider (View/Edit existing record)

Pattern matches: `TripDetailContent`, `RouteDetailContent`, `TenantDetailContent`

```
┌─────────────────────────────────┐
│ 🌑 DARK GRADIENT HEADER         │  ← SliderPanel (automatic, dark gradient)
│  Title (white, 15px bold)  [X]  │     + subtitle (11px, #94A3B8)
├─────────────────────────────────┤
│ .sl-action-bar                  │  ← Edit Details toggle + action buttons
│  [Edit Details] [Print] [...]   │
├─────────────────────────────────┤
│ Status badges + ID              │  ← Status row (12px 20px padding)
├─────────────────────────────────┤
│ .slider-tabs                    │  ← Tabs (Overview, Users, etc.)
│  [Tab1] [Tab2] [Tab3]          │
├─────────────────────────────────┤
│ Tab Content (padding: 20px)     │
│                                 │
│  ┌─ Section ──────────────────┐│
│  │ SECTION HEADER (icon+title)││
│  │ Field grid (1fr 1fr)       ││
│  │ Read-only: Field component ││
│  │ Editing: FormField component│
│  └────────────────────────────┘│
│                                 │
│  ┌─ Section ──────────────────┐│
│  │ ...                        ││
│  └────────────────────────────┘│
└─────────────────────────────────┘
```

**Key elements:**
- Action bar uses `.sl-action-bar` CSS class
- Edit toggle uses `.sl-action-btn .sl-edit-toggle-btn` with `.active` state
- Tabs use `.slider-tabs` and `.slider-tab` / `.slider-tab.active`
- Content toggles between `<Field>` (read-only) and `<FormField>` (editing) based on `isEditing` state

### B. Create Slider (New record form)

Pattern matches: `RouteCreateContent`, `TripCreateContent`, `TenantCreateContent`

```
┌─────────────────────────────────┐
│ 🌑 DARK GRADIENT HEADER         │  ← SliderPanel (automatic, dark gradient)
│  Title (white, 15px bold)  [X]  │     + subtitle (11px, #94A3B8)
├─────────────────────────────────┤
│ Sticky action bar               │  ← position: sticky, top: 0, z-index: 10
│  [✓ Create]                     │     Primary action only (no Cancel)
├─────────────────────────────────┤
│ Form content (20px padding)     │
│                                 │
│  ┌─ Section (color-coded) ────┐│  ← 1.5px border, 14px radius
│  │ EMOJI SECTION TITLE        ││  ← gradient headerBg, accent color
│  │ FormField grid (1fr 1fr)   ││
│  └────────────────────────────┘│
│                                 │
│  ┌─ Section (different color) ┐│
│  │ ℹ Info banner (optional)   ││  ← Yellow info box
│  │ FormField grid             ││
│  └────────────────────────────┘│
└─────────────────────────────────┘
```

**IMPORTANT — No dark headers in content components!**
The dark gradient header is rendered **exclusively** by `SliderPanel.jsx`.
Content components (like RouteCreateContent, TripCreateContent, etc.) should
**never** include a `<div>` with `background: linear-gradient(135deg, #1E293B...)`.
Pass title/subtitle via `openSlider({ title, subtitle, ... })` instead.

### Reusable Components (defined in each slider file)

#### `Field` — Read-only display
```jsx
<Field label="Company Name" value={data.name} />
<Field label="GSTIN" value={data.gstin} mono />  // monospace font
```
Renders as: uppercase label + bordered box with value (background: #F8FAFC)

#### `FormField` — Editable input
```jsx
<FormField label="Company Name" value={form.name} onChange={set('name')} required />
<FormField label="Type" value={form.type} onChange={set('type')} options={OPTIONS} />
```
Renders as: uppercase label + input with blue focus ring

#### `Section` — Collapsible card wrapper
```jsx
<Section title="Details" icon="fas fa-info-circle" iconColor="#7C3AED"
  borderColor="#C4B5FD" headerBg="#F5F3FF">
  {/* content */}
</Section>
```

**Section color themes:**
| Theme | borderColor | headerBg | accentColor |
|-------|-------------|----------|-------------|
| Purple | #C4B5FD | #F5F3FF / linear-gradient(135deg, #F5F3FF, #EDE9FE) | #6D28D9 |
| Blue | #BAE6FD | #F0F9FF / linear-gradient(135deg, #F0F9FF, #E0F2FE) | #0369A1 |
| Green | #A7F3D0 | #F0FDF4 | #059669 |
| Orange | #FDBA74 | linear-gradient(135deg, #FFF7ED, #FFEDD5) | #9A3412 |
| Red | #FECACA | linear-gradient(135deg, #FEF2F2, #FFE4E6) | #DC2626 |
| Gray | #E2E8F0 | #F8FAFC | #64748B |

#### `Section` / `SectionCard` — headerAction Prop (CRITICAL PATTERN)
When a section contains **tabular or list data** (e.g., expenses, advances, documents, fuel entries,
driver assignments), the **Add/Upload/Action button MUST be placed in the section header** (right side)
via the `headerAction` prop — **never as a full-width button or inline button inside the section body**.

This applies to **both** `Section` and `SectionCard` components. Common cases:
- Expenses list → "Add Expense" button in header
- Advances list → "Add Advance" button in header
- Documents list → "Upload" button in header
- Any list with an add/create action

```jsx
// ✅ CORRECT — compact action button in section header (right side)
<Section title="Expenses" icon="fas fa-receipt" iconColor="#DC2626" borderColor="#FECACA" headerBg="#FEF2F2"
  headerAction={canEdit && (
    <button onClick={() => setShowAdd(!showAdd)}
      style={{ padding: '3px 10px', border: '1.5px solid #FECACA', borderRadius: 6, fontSize: 10,
               fontWeight: 700, cursor: 'pointer', background: showAdd ? '#FEE2E2' : '#fff',
               color: showAdd ? '#DC2626' : '#1E293B', display: 'flex', alignItems: 'center', gap: 4 }}>
      <i className={`fas fa-${showAdd ? 'times' : 'plus'}`} style={{ fontSize: 9 }}></i>
      {showAdd ? 'Cancel' : 'Add Expense'}
    </button>
  )}
>
  {showAdd && <AddExpenseForm ... />}
  {/* list content */}
</Section>

// ✅ ALSO CORRECT — using SectionAddBtn
<Section title="Fuel Log" emoji="⛽" borderColor="#FDBA74" accentColor="#9A3412"
  headerAction={<SectionAddBtn label="Add Fuel Entry" icon="plus" color="#9A3412" onClick={toggle} />}
>
  {showForm && <AddFuelForm ... />}
  {/* list content */}
</Section>

// ❌ WRONG — full-width button inside section body
<Section title="Documents" emoji="📎">
  <button style={{ width: '100%' }} onClick={toggle}>Upload Document</button>  // ← DO NOT DO THIS
</Section>

// ❌ WRONG — action button inside section body with marginBottom
<Section title="Expenses">
  <button style={{ marginBottom: 10 }} onClick={toggle}>Add Expense</button>  // ← DO NOT DO THIS
</Section>
```

**Multiple header actions** (e.g., filter + add button) use a React fragment:
```jsx
<Section title="Compliance Documents" ...
  headerAction={<>
    <select value={filter} onChange={...}>...</select>
    <SectionAddBtn label="Add Document" icon="plus" color="#0369A1" onClick={toggle} />
  </>}
>
```

#### `SectionAddBtn` — Reusable Header Action Button
Defined in `VehicleSliderContent.jsx`. Use for all section header add/toggle buttons.
```jsx
<SectionAddBtn label="Add Entry" icon="plus" color="#9A3412" onClick={fn} />
```
- `label`: Button text (toggles between "Add X" / "Cancel")
- `icon`: FontAwesome icon name without `fa-` prefix (e.g., `plus`, `times`, `user-plus`)
- `color`: Must match the section's `accentColor`
- Compact size (10px font, 3px/10px padding) designed to fit in section headers

### CSS Classes to Use (from overrides.css)
- `.sl-action-bar` — action bar below header
- `.sl-action-btn` — individual action button
- `.sl-edit-toggle-btn` / `.sl-edit-toggle-btn.active` — edit/save toggle
- `.slider-tabs` — tab container
- `.slider-tab` / `.slider-tab.active` — individual tab
- `.sl-section` — section wrapper for simple key-value groups
- `.sl-section-title` — section heading
- `.sl-row` — label-value row
- `.sl-row-label` + `.sl-row-value` — label and value spans

### Slider Store Usage
```jsx
import useSliderStore from '../../stores/sliderStore';

// Open — ALWAYS pass title, optionally subtitle
const { openSlider } = useSliderStore();
openSlider({
  title: 'Record Name',
  subtitle: 'Contextual info (e.g. client • vehicle)',  // optional, shows below title
  width: '580px',  // or '52vw' for wider sliders
  content: <DetailContent data={record} onRefresh={refresh} />,
});

// Close (inside slider content)
const { closeSlider } = useSliderStore();
closeSlider();
```

---

## 3. Backend Patterns (Spring Boot)

### Entity Pattern
```java
@Entity @Table(name = "entities")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MyEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    // fields...
    @Column(name = "tenant_id")
    private UUID tenantId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}
```

### Service Pattern
```java
@Service @Transactional
public class MyService {
    private final MyRepository repo;
    private final MyMapper mapper;
    // constructor injection...
}
```

### DTO Pattern
- Request: `Create{Entity}Request.java`
- Response: `{Entity}Response.java`
- Use MapStruct mapper: `@Mapper(componentModel = "spring")`

### API Naming
- Base path: `/api/v1/` (set via context-path)
- CRUD: `GET /entities`, `GET /entities/{id}`, `POST /entities`, `PUT /entities/{id}`, `DELETE /entities/{id}`
- Platform endpoints: `/platform/tenants`, `/platform/tenants/{id}/users`, etc.

---

## 4. Frontend Patterns (React + Vite)

### File Organization
```
src/pages/{module}/
  {Entity}Page.jsx          ← List page with table + stats
  {Entity}SliderContent.jsx  ← Detail + Create slider components
  # Or split into:
  {Entity}DetailContent.jsx  ← Detail slider
  {Entity}CreateContent.jsx  ← Create slider
```

### API Service Pattern
```javascript
// src/services/{module}Service.js
import api from './api';
export default {
  getAll: () => api.get('/entities'),
  getById: (id) => api.get(`/entities/${id}`),
  create: (data) => api.post('/entities', data),
  update: (id, data) => api.put(`/entities/${id}`, data),
  delete: (id) => api.delete(`/entities/${id}`),
};
```

### Page Pattern (List pages)
```jsx
export default function EntitiesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { openSlider } = useSliderStore();

  // fetch, filter, handleRowClick, handleAdd...

  return (
    <div>
      <div className="page-header">...</div>
      <div className="stats-row">...</div>
      <div className="table-container">...</div>
    </div>
  );
}
```

### Key CSS Classes for List Pages
- `.page-header` + `.page-header-actions` — page title + buttons
- `.stats-row` + `.stat-card` — stats overview
- `.table-container` + `.table-toolbar` — table wrapper
- `.search-input` — search field
- `.btn .btn-primary` / `.btn .btn-secondary` — buttons
- `.pagination-info` — showing X of Y

---

## 5. Multi-Tenancy Rules

- **Platform Admins** (`platform_admins` table) ≠ **Tenant Users** (`users` table) — NEVER mix
- All business entities have `tenant_id` column
- Gobind Transport (`e9999999-...`) = primary test tenant
- All UUIDs must use valid hex characters only (0-9, a-f)

---

## 6. UX Rule — Action Buttons at the Top (CRITICAL)

**All actionable buttons MUST appear at the TOP of their view**, immediately after any heading/title.
Users should **never** need to scroll down to find primary actions (Back, Next, Submit, Save, Import, etc.).

### Rules:
1. **Wizard steps**: Place the action bar (Back / Next / Save) directly below the step title, **before** the main content.
2. **Form views**: Action buttons (Save, Cancel) go in a sticky header or right below the title — never at the bottom.
3. **Responsive**: On all screen sizes, action buttons must remain visible at the top. Content scrolls beneath them.
4. **No bottom footers for actions**: Do NOT use bottom-pinned footers or end-of-page action rows. Export/download links (secondary actions) may appear inline near the relevant data, but primary navigation and submission buttons stay at the top.

### Pattern:
```
┌─────────────────────────────┐
│ Step Title / Heading        │
├─────────────────────────────┤
│ [← Back] [Save]  [Next →]  │  ← Action bar (always visible, top)
├─────────────────────────────┤
│ Main content (scrollable)   │
│ ...                         │
└─────────────────────────────┘
```

---

## 7. Slider Action Bar — No Cancel Button, Use Delete (CRITICAL)

**Never show a "Cancel" button on slider action bars.** The slider panel's **X close button** (top-right corner of the dark header) already serves as the cancel/close action.

### Rules:
1. **Create sliders**: Show only the primary action button (e.g., `[✓ Create]`). No Cancel button.
2. **Detail/Edit sliders**: Show `[Edit]` (toggles to `[Save]`) on the left, and `[🗑 Delete]` on the **right** side (pushed via `flex: 1` spacer).
3. **Cancel = redundant**: Users close the slider via the header X button. A Cancel button wastes action bar real estate.
4. **Delete button**: Use the `.sl-delete-btn` CSS class (red recycle icon) for all destructive actions in sliders.

### Pattern:
```
Create Mode:
┌─────────────────────────────┐
│ [✓ Create]                  │  ← Only primary action, no Cancel
└─────────────────────────────┘

Detail/Edit Mode:
┌─────────────────────────────┐
│ [Edit/Save]    [🗑 Delete]  │  ← Edit left, Delete pushed right
└─────────────────────────────┘
```

### Example:
```jsx
// ✅ CORRECT — No Cancel, Delete on right
<div className="sl-action-bar">
  <button className="sl-action-btn sl-edit-toggle-btn active" onClick={handleSave}>
    <i className="fas fa-check"></i> Save
  </button>
  <div style={{ flex: 1 }}></div>
  <button className="sl-delete-btn" onClick={handleDelete}>
    <i className="fas fa-recycle"></i> Delete
  </button>
</div>

// ❌ WRONG — Cancel button wastes space
<div className="sl-action-bar">
  <button onClick={handleSave}>Save</button>
  <button onClick={closeSlider}>Cancel</button>  // ← DO NOT DO THIS
</div>
```

