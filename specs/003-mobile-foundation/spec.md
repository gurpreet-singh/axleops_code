# Feature Specification: Mobile Foundation

**Feature Branch**: `003-mobile-foundation`  
**Created**: 2026-03-28  
**Status**: Draft  
**Target Role(s)**: All roles (architectural) · Driver (v1 validation)  
**Input**: User description: "Define the mobile codebase foundation — app shell, navigation, auth dependencies, network/API conventions, real-vs-mock switching, design-system integration, state handling patterns, file upload baseline, analytics hooks, and module structure — needed before any driver-facing business feature can be built reliably."  
**Depends On**: [spec-001 Mobile Role Strategy](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/spec.md) · [spec-002 Design Foundation](file:///Users/ankit/a/fleetly/axleops_code/specs/002-design-foundation/spec.md)

---

## Why This Foundation Exists

Business features (Active Trip, Past Trips, Earnings, Settings) require shared infrastructure that cannot be built piecemeal. Without a foundation:

- **Each feature would reinvent** network configuration, error handling, auth token management, and mock switching — creating divergent patterns that are expensive to reconcile.
- **Design consistency would degrade** because there would be no single source for theme tokens, shared components, or state-handling conventions.
- **QA would have no mechanism** to switch between real and mock data or manipulate test scenarios — blocking effective testing until late in development.
- **Future role integration would require rework** because navigation, shell, and data-layer patterns were authored only for Driver.

This spec defines the minimum viable infrastructure layer that all subsequent features compose on top of.

---

## User Scenarios & Testing

### User Story 1 — Developer Builds a Feature on a Ready Codebase (Priority: P1)

A developer tasked with building the Active Trip screen opens the `/mobile` project and finds: a running app shell with role-scoped navigation, a configured API client with auth headers, mock data sources for trip payloads, a design theme matching the AxleOps brand, and shared state-handling composables. They start writing feature code immediately — no infrastructure setup required.

**Why this priority**: This is the entire purpose of the foundation. If a developer must solve infrastructure problems before writing feature code, every subsequent epic is delayed and inconsistent.

**Independent Test**: A developer creates a new screen that fetches trip data via the repository layer, displays it using the design system components, handles loading/error/empty states with shared composables, and runs on both Android and iOS simulator — all without modifying any foundation files.

**Acceptance Scenarios**:

1. **Given** the foundation is complete, **When** a developer creates a new feature screen, **Then** they can use the API client, repository pattern, design tokens, and state-handling patterns without writing or modifying any infrastructure code.
2. **Given** the foundation provides a mock data source for a feature, **When** the developer builds the feature, **Then** they can develop and demonstrate the complete UX without waiting for backend readiness.
3. **Given** the foundation is complete, **When** the developer runs the app on both Android (emulator) and iOS (simulator), **Then** the app shell, navigation, and theme render correctly on both platforms.

---

### User Story 2 — QA Switches Between Real and Mock Data Sources (Priority: P1)

A QA engineer testing the app can switch individual features between real backend APIs and local mock data. They can also edit mock JSON fixtures to simulate edge cases (empty lists, error states, large payloads) without code changes.

**Why this priority**: Without mock/real switching, QA cannot test features until backend endpoints are complete. This blocks the entire test cycle and forces serial development.

**Independent Test**: QA toggles a feature from mock to real mode (via build flag or debug menu), observes the app fetching from the live backend, then toggles back to mock mode and edits a JSON fixture to return an empty list — the app displays the empty state.

**Acceptance Scenarios**:

1. **Given** a feature is configured for mock mode, **When** QA changes it to real mode, **Then** the app calls the live backend API for that feature — with no UI or behavior changes beyond the data source.
2. **Given** a feature is in mock mode, **When** QA edits a mock JSON fixture file, **Then** the app reflects the modified data on next launch — no code change or rebuild required.
3. **Given** multiple features are configured independently, **When** some are in mock mode and others in real mode, **Then** the app operates seamlessly across both — no visible distinction to the user.

---

### User Story 3 — App Starts and Routes to the Correct Role Experience (Priority: P1)

A user launches the app. If they have a valid session, the app validates it, resolves their role, and navigates to the role-scoped shell. If their session is expired or absent, they see the login screen. If their role is not yet supported, they see a clear informative message.

**Why this priority**: Startup routing is the first user interaction. If the app cannot correctly resolve auth state and role, no downstream feature works.

**Independent Test**: Launch the app with a valid session token → lands on Driver shell. Launch with an expired token → lands on login. Launch with a role that is not mobile-supported → shows informative message.

**Acceptance Scenarios**:

1. **Given** a user has a valid session, **When** the app launches, **Then** the app validates the session via the backend, resolves the role, and presents the role-scoped shell within 3 seconds.
2. **Given** a user has an expired or absent session, **When** the app launches, **Then** the app shows the login screen — no flash of authenticated content.
3. **Given** a user has only non-mobile-supported roles, **When** the app resolves their role, **Then** a clear message is shown instead of a crash or blank screen.
4. **Given** the backend is unreachable during session validation, **When** the app launches, **Then** the app shows an error state with retry — it does not silently proceed or crash.

---

### User Story 4 — App Handles Network Failures Gracefully (Priority: P1)

A driver using the app in a rural area with poor connectivity encounters network failures. The app shows clear connectivity indicators, does not crash, provides retry affordances, and preserves previously loaded data.

**Why this priority**: Drivers operate in low-connectivity environments (Constitution Principle VII). If the foundation does not establish baseline network failure handling, every feature must invent its own — resulting in inconsistent and fragile behavior.

**Independent Test**: Place the device in airplane mode while on a data-loaded screen. The app shows an offline indicator, data remains visible, and actions that require network are disabled with an explanation. Reconnect — the app recovers.

**Acceptance Scenarios**:

1. **Given** the device is offline, **When** any screen attempts a network request, **Then** the app shows the offline state (banner + explanation) — no blank screens or crashes.
2. **Given** previously loaded data exists, **When** the device goes offline, **Then** the data remains visible with a "Last updated X min ago" timestamp.
3. **Given** the device reconnects, **When** the user retries an action, **Then** the request succeeds and the offline indicator clears.
4. **Given** a network request fails due to a transient error (timeout, 5xx), **When** the error state renders, **Then** a retry affordance is shown.

---

### User Story 5 — App Environment Is Configurable per Build (Priority: P2)

Development, staging, and production builds target different backend URLs, enable/disable mock modes, and may toggle debug features. The build configuration clearly defines these environments without code changes.

**Why this priority**: Without environment configuration, developers hardcode URLs and toggle mocks by editing source files — error-prone and risky for production.

**Independent Test**: Build the app in staging mode and verify it targets the staging backend URL. Build in production mode — mock toggles and debug features are excluded from the binary.

**Acceptance Scenarios**:

1. **Given** a development build, **When** the app runs, **Then** it targets the development backend URL, mock switching is enabled, and debug tools are accessible.
2. **Given** a production build, **When** the app is compiled, **Then** mock data sources and debug toggles are excluded from the binary.
3. **Given** the environment changes from staging to production, **When** the developer switches the build variant, **Then** no source file edits are required — only the build configuration differs.

---

### User Story 6 — App Provides Baseline File and Document Upload Capability (Priority: P2)

A feature requiring file uploads (photos for POD evidence, documents for inspections) can use a foundation-level upload service that handles capture, preview, progress, retry, and size validation — without implementing upload infrastructure from scratch.

**Why this priority**: Multiple future features (POD capture, inspection photos, expense receipts, breakdown evidence) require file uploads. Building this per-feature creates duplication and inconsistency.

**Independent Test**: A developer integrates the upload service into a test screen, captures a photo, sees a thumbnail preview, observes upload progress, and verifies the file is stored (or mock-stored). They then simulate a failure — the retry mechanism works.

**Acceptance Scenarios**:

1. **Given** a feature needs file upload, **When** the developer uses the foundation upload service, **Then** they get capture (camera or gallery), preview, progress, retry, and size validation — without building any of these.
2. **Given** an upload fails mid-transfer, **When** the failure is detected, **Then** the user sees a retry affordance and previously entered data is not lost.
3. **Given** the backend upload endpoint is not yet available, **When** the upload service runs in mock mode, **Then** files are stored locally and a mock URL is returned — feature development proceeds unblocked.

---

### User Story 7 — App Captures Baseline Analytics and Diagnostic Data (Priority: P3)

When a user interacts with the app, basic analytics events (screen views, key actions, errors) are captured through a foundation-level analytics hook. This data helps the team understand usage patterns and diagnose issues.

**Why this priority**: Analytics are a cross-cutting concern. If each feature invents its own logging, the data is inconsistent and hard to aggregate. The foundation provides the hook; features use it.

**Independent Test**: Navigate between screens in the app. Verify that screen-view events are logged. Trigger an error — verify the error is logged with context. Check that analytics events are captured in the local log (no external service required for the foundation).

**Acceptance Scenarios**:

1. **Given** the analytics hook is integrated, **When** a user navigates to any screen, **Then** a screen-view event is logged with screen name and timestamp.
2. **Given** an error occurs, **When** the error is caught, **Then** the error is logged with context (screen, action, error type) via the analytics hook.
3. **Given** the foundation provides a logging interface, **When** a feature developer wants to log a custom event, **Then** they call the analytics API — no setup or configuration required.

---

### Edge Cases

- What happens when the backend returns an unexpected HTTP status (e.g., 403, 429, 502)? → The API client maps each to a defined error type. 403 triggers re-auth flow. 429 shows a "too many requests" message with retry delay. 5xx shows a generic server error with retry.
- What happens when a mock JSON fixture is malformed? → The mock data source catches parse errors and returns an error state — not a crash. The error is logged with the fixture filename.
- What happens when the app is killed and restarted mid-feature-flow? → The foundation does not guarantee cross-session state persistence (that is a feature-level concern). It does guarantee that session tokens persist and the app routes correctly on restart.
- What happens when the device has extremely low storage and file upload needs space? → The upload service checks available storage before capture and shows a clear message if insufficient.
- What happens when the backend changes an API response shape? → DTOs are separate from domain models. The mapper layer handles shape differences. If a field is missing, the mapper provides a sensible default or surfaces a parse error (depending on field criticality).
- What happens when both Android and iOS need platform-specific behavior (e.g., GPS, camera)? → The foundation uses expect/actual interfaces in shared code. Each platform provides its implementation. If a platform implementation is missing, the app shows a graceful "not available" state.

---

## Clarifications

### Session 2026-03-28

- Q: Does the Foundation epic own implementing per-tab navigation controllers (one NavHost per tab with push/pop routing), or does it only define the contract and leave the first actual navigation wiring to the Driver Active Trip epic? → A: Option A — Foundation implements per-tab NavHost with push/pop routing, back handling, and tab-state preservation. Feature epics register their screens into this framework.
- Q: Should Foundation implement the HYBRID data source mode (real API with client-side supplementation), or defer it? → A: Option B — Defer. Remove "hybrid" from spec. Features that need real-fetch-plus-supplementation handle it in their own real-data-source implementations with post-processing mappers, not via a special DI mode.
- Q: What level of upload implementation does Foundation deliver — working service with platform camera/gallery integration, or interface-only? → A: Option A — Foundation ships a fully working upload service: platform camera/gallery expect/actual, preview composable, progress composable, mock backend. Ready to use in any feature.
- Q: Should the foundation re-validate the session on app foreground after a period in background, and if so, what threshold? → A: Option C — Re-validate after ≥ 30 minutes in background. Shorter thresholds cause excessive re-validation during normal app switching; 30 min matches a reasonable "away from work" period.
- Q: What should the top bar title display — the role name ("Driver") or the current screen/tab name ("Active Trip")? → A: Option B — Show current screen/tab name. The role label wastes prominent screen real estate on information the user already knows. Since Foundation implements per-tab NavHost, the destination label is available to drive the title.

---

## Requirements

### Functional Requirements

#### 1. App Shell Structure

- **FR-001**: The app MUST use a three-zone shell layout: header bar (top), content area (center), and bottom tab bar — as defined in [spec-002 FR-006](file:///Users/ankit/a/fleetly/axleops_code/specs/002-design-foundation/spec.md).
- **FR-001a**: The top bar title MUST display the current screen or tab name (e.g., "Active Trip", "Past Trips", "Earnings", "Settings"), NOT the role label. The title is driven by the active navigation destination’s label from the per-tab NavHost. On tab landing screens, the title matches the tab label. On detail screens, the title reflects the detail screen’s display name.
- **FR-002**: The shell MUST support safe area insets on all edges (notch, home indicator, rounded corners) on both Android and iOS.
- **FR-003**: The shell MUST host role-specific content within the content area while keeping the header and tab bar structurally shared.
- **FR-004**: The shell MUST show a connection status indicator in the header when the device is offline.

#### 2. Navigation Baseline

- **FR-005**: The app MUST use bottom tabs for top-level destinations, with tab configuration driven by the role configuration registry (as defined in [spec-001 FR-009](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/spec.md)). The foundation MUST implement a per-tab `NavHost` (one navigation controller per tab) so that feature epics can register their screens into the framework without building navigation infrastructure.
- **FR-006**: Each tab MUST maintain its own independent navigation stack via its dedicated `NavHost`. Switching tabs MUST preserve each tab's stack state. Re-tapping the active tab MUST reset that tab's `NavHost` to its root screen. Feature screens register into the per-tab `NavHost` — they do not create their own navigation controllers.
- **FR-007**: Drill-down navigation MUST use stack-based push/pop. Modal sheets MUST be used for actions that do not leave the current context (e.g., expense entry, photo capture).
- **FR-008**: Back navigation (hardware back button or gesture) MUST always pop the current screen or dismiss a modal. The behavior MUST be consistent across Android and iOS.
- **FR-009**: The navigation system MUST support deep linking (for future push notification integration) — even if not fully wired in the foundation, the structure MUST NOT preclude it.

#### 3. Role-Aware Startup & Landing Readiness

- **FR-010**: On app launch, the app MUST check for a persisted session token. If present, it MUST validate the session by calling the backend session validation endpoint. If valid, it MUST resolve the user's role and navigate to the role-scoped shell.
- **FR-011**: If the session token is absent or invalid, the app MUST navigate to the login screen. No authenticated content MUST flash before the login screen appears.
- **FR-012**: Role resolution MUST follow the rules from [spec-001 FR-004/FR-005](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/spec.md): auto-select if one role, show selector if multiple mobile-supported roles, filter out unsupported roles.
- **FR-013**: The startup flow MUST handle the case where the backend is unreachable: show an error state with retry, do not crash or proceed with a stale session.
- **FR-014**: The startup flow MUST complete (session check → role resolution → shell render) within 3 seconds under normal network conditions.
- **FR-014a**: When the app returns to foreground after ≥ 30 minutes in background, it MUST silently re-validate the session via `GET /auth/me`. If still valid, resume normally. If expired (401), clear the session and navigate to the Login screen. If the re-validation network call fails, do NOT disrupt the user — let the next API call trigger the 401 interceptor if the session is truly expired.

#### 4. Foundation-Level Auth/Session Dependencies

> Note: This spec defines the auth/session **infrastructure** the foundation provides. Full login UI, registration, and password management are part of a subsequent "Driver Auth & Session" epic.

- **FR-015**: The foundation MUST provide a secure token storage mechanism using platform-appropriate facilities (encrypted storage on Android, Keychain on iOS).
- **FR-016**: The foundation MUST provide an auth state observable that any screen or ViewModel can observe to react to auth state changes (authenticated, unauthenticated, expired).
- **FR-017**: The foundation MUST handle 401 responses globally: clear the session, navigate to the login screen, and notify the user. This MUST NOT require per-feature 401 handling.
- **FR-018**: The foundation MUST provide the infrastructure for session persistence across app restarts — storing and retrieving the JWT token and the selected role.
- **FR-019**: The foundation MUST NOT implement the login screen, registration, password change, or full auth UX — those are deferred to the Driver Auth & Session epic. The foundation provides the plumbing (token store, interceptor, auth state), not the UI.

#### 5. Network / API Client Conventions

- **FR-020**: The app MUST use a single, centrally configured API client for all HTTP communication with the backend.
- **FR-021**: The API client MUST automatically attach the JWT token as a `Bearer` authorization header on every authenticated request.
- **FR-022**: The API client MUST use a configurable base URL that varies by build environment (development, staging, production).
- **FR-023**: The API client MUST handle JSON serialization and deserialization using a standard library, with all DTOs defined separately from domain models.
- **FR-024**: The API client MUST implement standardized error handling: mapping HTTP status codes to defined error types (network error, auth error, client error, server error, timeout).
- **FR-025**: The API client MUST support request timeouts with configurable durations. Default connect timeout: 10 seconds. Default read timeout: 30 seconds.
- **FR-026**: The API client MUST log all requests and responses at debug level for development builds. Logging MUST be disabled in production builds.
- **FR-027**: The API client MUST support multipart form data for file uploads (used by the upload baseline).

#### 6. Closest-Contract Definition Strategy

- **FR-028**: Where backend APIs exist and are sufficient, the app MUST call them directly — no wrapping, proxying, or local reimplementation (per Constitution Principle III.1).
- **FR-029**: Where backend APIs are incomplete, the app MUST define derived API contracts that follow the backend's existing conventions (URL patterns: `/api/v1/{resource}`, naming, DTO shapes, pagination patterns).
- **FR-030**: Derived contracts MUST be documented in `specs/<feature>/derived-contracts.md` with: endpoint shape, source rationale, and a reference to the backend entity/service it was derived from (per Constitution Principle III.2).
- **FR-031**: Derived contracts MUST be backed by local mock responses that return realistic, spec-consistent data (per Constitution Principle III.3).
- **FR-032**: The app's networking and repository layer MUST be structured so that replacing a mock data source with a real API requires only swapping the data-source implementation — no changes to UI or domain code (per Constitution Principle III.4).

#### 7. Real-vs-Mock Switching Strategy

- **FR-033**: The app MUST support per-feature data source switching between real (backend API) and mock (local JSON fixtures) modes. Hybrid supplementation (real fetch + client-side enrichment) is a feature-level concern handled within the feature's real data source implementation, not a foundation-level DI mode.
- **FR-034**: Data source mode MUST be configurable via build-time flags for each environment. Development and staging builds MUST support runtime toggling (debug menu or configuration). Production builds MUST use real mode with no mock fallback.
- **FR-035**: The switching mechanism MUST operate at the repository level. The DI container provides either the real or mock data-source implementation based on the active configuration. Screens and ViewModels MUST NOT know or care which source is active.
- **FR-036**: Switching a feature from mock to real (or vice versa) MUST require zero changes to UI code, ViewModel code, or domain model code. Only the DI binding or configuration flag changes.

#### 8. Local Mock JSON Strategy

- **FR-037**: Mock data MUST be stored as JSON fixture files bundled with the app (in resource directories accessible at runtime).
- **FR-038**: Mock data MUST be realistic and spec-consistent. It MUST use the same field names, value ranges, and relationships as the real backend would produce (per Constitution Principle VIII).
- **FR-039**: QA MUST be able to manipulate mock payloads by editing JSON fixture files. Editing a fixture and relaunching the app MUST reflect the changes — no code change required.
- **FR-040**: Mock data sources MUST simulate realistic latency (configurable delay) to surface loading-state UX issues during testing.
- **FR-041**: The mock infrastructure MUST cover: success responses, empty responses (empty arrays), error responses (simulated server errors), and large payloads (pagination scenarios).

#### 9. Environment / Config Setup Expectations

- **FR-042**: The app MUST support at least three build environments: development, staging, and production — each with a distinct backend base URL.
- **FR-043**: Environment-specific values (base URL, mock toggle defaults, log levels, feature flags) MUST be defined in build configuration — not hardcoded in source files.
- **FR-044**: Debug features (mock toggle, analytics log viewer, network inspector) MUST be available in development and staging builds and MUST be completely excluded from production builds.
- **FR-045**: The app MUST support a build configuration that sets the `applicationId` / bundle identifier per environment to allow side-by-side installation of different environments on the same device.

#### 10. Design System Integration from Design Foundation

- **FR-046**: The app MUST integrate the design token system from spec-002 as the single source of truth for colors, typography, spacing, elevation, and shapes.
- **FR-047**: All screens and components MUST consume design tokens from the theme — no hardcoded color values, font sizes, or spacing outside the token system.
- **FR-048**: The foundation MUST provide the shared component library defined in spec-002: buttons, cards, input fields, badges, status pills, and state screens (loading skeleton, error, empty, offline).
- **FR-049**: The foundation MUST provide the trip status visual language (phase colors, icons, badges, milestone stepper components) as reusable composables.
- **FR-050**: The design system MUST be implemented as a composable theme that can be applied at the app root, propagating to all screens — ensuring a single token change cascades everywhere.

#### 11. Loading / Empty / Error / Blocked / Offline Baseline Behavior

- **FR-051**: The foundation MUST define and implement a sealed UX state model with at least these states: `Loading`, `Empty(message, action?)`, `Error(message, retryAction)`, `Success(data)`, and `Offline(staleData?, lastUpdated?)`.
- **FR-052**: The foundation MUST provide shared composable screens for each non-success state: `LoadingScreen` (skeleton matching expected content layout), `EmptyScreen` (illustration + message + optional action), `ErrorScreen` (message + retry button), `OfflineScreen` (banner + stale data + timestamp).
- **FR-053**: Every screen built on the foundation MUST declare which UX states it handles. If a screen justifiably omits a state (e.g., Settings has no empty state), the omission MUST be documented.
- **FR-054**: The `Blocked` state (user action blocked by a business rule, e.g., "Cannot depart without EWB") MUST be renderable inline on any action screen with a clear explanation and resolution guidance.
- **FR-055**: State transitions (loading → success, error → retry → loading) MUST animate smoothly — no abrupt content jumps or layout shifts — per spec-002 FR-029.

#### 12. File / Document Upload Baseline

- **FR-056**: The foundation MUST provide a fully working, reusable upload service that supports: image capture (camera), image selection (gallery), document selection, multipart upload to a configurable endpoint, progress tracking, and retry on failure. This is a complete implementation — including platform camera/gallery integration via expect/actual, preview composable, and progress UI — not just an interface. Feature epics use it directly without building upload infrastructure.
- **FR-057**: The upload service MUST support mock mode: in mock mode, files are stored locally and a mock URL is returned. In real mode, files are uploaded to the backend file upload endpoint.
- **FR-058**: The upload service MUST validate file size before upload and communicate size limits to the user. Maximum file size limits MUST be configurable.
- **FR-059**: The upload service MUST provide thumbnail preview after capture/selection, before the file is uploaded.
- **FR-060**: The upload service MUST handle platform-specific permissions (camera, gallery, storage) via the expect/actual pattern, requesting permissions at the point of use with clear rationale messages.

#### 13. Analytics / Logging Baseline Hooks

- **FR-061**: The foundation MUST provide an analytics interface with methods for: screen view events, action events (user taps, form submissions), error events, and custom key-value events.
- **FR-062**: The analytics interface MUST be backed by a local logging implementation in the foundation. Integration with a remote analytics service (e.g., Firebase Analytics) is a future responsibility — the foundation provides the contract and local fallback.
- **FR-063**: The foundation MUST provide a structured logging utility for diagnostic logs (debug, info, warning, error levels). Logs MUST include contextual information (screen name, user role, timestamp).
- **FR-064**: Diagnostic logging MUST respect build environment: verbose in development, minimal in staging, errors-only in production.
- **FR-065**: The analytics and logging interfaces MUST be injectable via DI — allowing future replacement of the local implementation with a remote service without changing call sites.

#### 14. Module / Package Structure inside `/mobile`

- **FR-066**: The mobile codebase MUST follow a layered module structure separating concerns: presentation (UI + ViewModels), domain (models + repository interfaces), data (repository implementations + data sources + DTOs + mappers), and dependency injection.
- **FR-067**: Domain models MUST be pure Kotlin with no dependencies on networking, UI, or platform-specific libraries.
- **FR-068**: DTOs (data transfer objects for API communication) MUST be separate from domain models. A mapper layer MUST translate between DTOs and domain models.
- **FR-069**: UI code MUST be organized by role (e.g., `ui/driver/`, `ui/dispatch/`) with shared components in `ui/common/` or `ui/components/`. Role-specific code MUST NOT leak into shared modules.
- **FR-070**: Platform-specific implementations (GPS, secure storage, camera, permissions) MUST use the expect/actual pattern. Shared code defines the interface; platform modules provide implementations.
- **FR-071**: The DI configuration MUST allow swapping data source implementations (real ↔ mock) without modifying the module structure or component code.

### Key Entities

- **App Configuration**: The set of environment-specific values (backend URL, build type, feature flags, mock toggle defaults) that govern app behavior per build variant. Not user-visible — consumed by infrastructure code.
- **Auth Session**: The persisted authentication state including JWT token, selected role, and user identity. Used by the API client, startup flow, and role resolution. Stored securely on-device.
- **Data Source Configuration**: The per-feature mapping of which data source mode (real, mock, hybrid) is active. Consumed by the DI container to resolve the correct data source implementation for each repository.
- **UX State Model**: The sealed type representing the lifecycle state of a screen's data: Loading, Empty, Error, Success, Offline. Consumed by all screens to render state-appropriate UI.
- **Upload Job**: Represents an in-progress or completed file upload: source file reference, upload progress, result (URL or error), retry state. Used by the upload service and any feature requiring file uploads.
- **Analytics Event**: A structured record of a user action, screen view, or error — including event type, context (screen, role, timestamp), and optional key-value payload. Published through the analytics interface.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: A developer can create a new feature screen (fetching data, rendering with design tokens, handling all UX states) without modifying any foundation file — verified by demonstrating zero diff in foundation code after the feature is built.
- **SC-002**: QA can switch any feature between mock and real data sources within 30 seconds (via debug menu or config change) and the app continues to operate correctly.
- **SC-003**: QA can edit a mock JSON fixture and see the changed data on next app launch — no code change, no rebuild beyond standard relaunch.
- **SC-004**: The app starts, validates the session, resolves the role, and renders the role-scoped shell within 3 seconds on a standard device with normal connectivity.
- **SC-005**: 100% of foundation screens (startup, role selection, error, empty, offline) handle their applicable UX states — zero blank screens or unhandled crashes.
- **SC-006**: The app runs correctly on both Android (emulator/device) and iOS (simulator/device) — the foundation compiles and renders on both platforms.
- **SC-007**: Swapping a feature from mock to real data source requires zero changes to UI or domain code — verified by reviewing the diff and confirming only DI/config changes.
- **SC-008**: All foundation infrastructure (API client, token storage, analytics hooks, upload service) is injectable via DI — verified by confirming no static singletons or hardcoded dependencies in feature code.
- **SC-009**: The design token system is implemented as a single source of truth — changing one token value propagates to all dependent screens (verified by changing the primary color and confirming all screens update).
- **SC-010**: The module/package structure clearly separates presentation, domain, data, and DI concerns — verified by reviewing the directory layout and confirming no layer violations (e.g., no Ktor imports in domain code).

---

## Assumptions

- The existing backend auth endpoints (`POST /auth/login`, `GET /auth/me`, `POST /auth/select-role`, `POST /auth/logout`) work correctly and are the foundation's only real API dependencies. All other backend APIs are consumed by downstream feature epics, not the foundation itself.
- The Design Foundation (spec-002) has been executed and the design tokens, shared components, and state patterns are available as approved artifacts. This foundation spec consumes them — it does not re-define them.
- The Mobile Role Strategy (spec-001) has been executed and the role configuration registry, per-role navigation graphs, and shared shell are implemented. This foundation spec builds on that structure — it does not re-specify it.
- The KMP (Kotlin Multiplatform) project is the target platform, using Compose Multiplatform for shared UI, Ktor for networking, Koin for DI, and kotlinx-serialization for JSON — as established in the mobile-discovery architecture.
- The mobile codebase already exists at `/mobile` with a functional package structure (`com.axleops.mobile`) and established module boundaries (`shared`, `composeApp`). The foundation hardens and formalizes what partially exists.
- JWT token-based auth is the auth mechanism. No OAuth, SSO, or biometric auth is in scope for the foundation — those are future concerns.
- The backend follows Spring Boot conventions (`/api/v1/{resource}`, UUID IDs, `TenantContext` scoping, paginated responses). Derived contracts follow these patterns.
- File storage for uploads will be mock-backed (local device storage) in the foundation. Cloud storage (S3, etc.) is a backend concern resolved when the file upload endpoint ships.
- Offline support beyond "show stale data and offline indicator" is deferred. The foundation establishes the visual pattern for offline state but does NOT implement offline-first data persistence, queued mutations, or background sync.
- Push notifications are deferred. The foundation's navigation structure does NOT preclude deep linking, but push registration and handling are out of scope.

---

## Backend Gaps / Unclear Areas

| Area | Gap | Impact on Foundation | Mitigation |
|------|-----|---------------------|------------|
| **File upload endpoint** | No `POST /files/upload` endpoint exists | Upload baseline must work in mock mode | Mock stores files locally. Foundation defines the contract; real implementation swaps in later |
| **User ↔ Contact mapping** | No FK between `User` (auth) and `Contact` (driver profile) entities. `GET /auth/me` does not include `contactId` | Startup flow cannot fully resolve driver profile from session | Mock enriches `/me` response with `contactId`. Foundation treats this as a known gap (G-17 from discovery) |
| **Driver-scoped queries** | `GET /trips` returns all tenant trips, no `?driverId=` filter | Foundation's API client supports query params, but driver-scoped filtering is a feature-level concern | Feature epics will use hybrid mode (real fetch + client-side filter) until BE adds the param |
| **Error response format** | Backend error response structure is not fully standardized | API client error mapping may need adjustment | Foundation defines generic error types. Feature epics add specific error mappings as needed |
| **Environment URLs** | Staging and production backend URLs not yet finalized | Build config needs placeholder URLs | Foundation uses `localhost` for development. Staging/production URLs are configuration values filled in when available |

---

## Risks If Foundation Is Skipped or Underdesigned

| Risk | Impact | Likelihood (if skipped) |
|------|--------|------------------------|
| **Inconsistent error handling** | Each feature invents its own retry, error display, and failure recovery — leading to fragmented UX and duplicated code | High |
| **Mock-real switching not possible** | QA cannot test features until backend endpoints ship — creating a serial dependency that delays the entire release | High |
| **Design drift** | Without a shared theme and component library, screens diverge visually — requiring expensive retrofitting before release | High |
| **Auth flows break per-feature** | Without centralized 401 handling and token management, each feature handles auth errors differently — some crash, some silently fail | High |
| **Platform compilation failures** | Without establishing cross-platform (Android + iOS) compilation in the foundation, platform-specific issues surface late and block release | Medium |
| **Rework for second role** | Without role-agnostic infrastructure, adding the second mobile role (Dispatch Manager) becomes a refactoring project instead of a feature addition | Medium |
| **Upload infrastructure duplication** | POD capture, inspection photos, expense receipts, and breakdown evidence all need uploads. Without a shared service, each implements its own — 4× the code and 4× the bugs | Medium |
| **Undiagnosable production issues** | Without baseline analytics and logging, production issues are black boxes — no screen view data, no error context, no diagnostic traces | Medium |

---

## What Must Be Implemented Now vs Later

### Must Be Implemented Now (Foundation Scope)

| Area | What Specifically |
|------|-------------------|
| App shell | Three-zone layout, safe area handling, offline indicator |
| Navigation baseline | Bottom tabs driven by role config, per-tab stack, push/pop, modal sheets, back navigation |
| Auth session infrastructure | Token storage (secure), auth state observable, 401 interceptor, session persistence |
| API client | Configured HTTP client, JWT header injection, base URL per environment, JSON (de)serialization, error mapping, request logging, timeout config |
| Mock infrastructure | JSON fixture loading, mock data sources, per-feature mock/real switching via DI, simulated latency |
| Environment config | Build variants (dev/staging/prod), environment-specific values, debug-only features |
| Design system integration | Theme application at app root, shared components wired, state screen composables |
| UX state model | Sealed state class, shared composable screens for all non-success states |
| Upload service interface | Capture/select, preview, progress, retry, mock mode, permission handling |
| Analytics/logging hooks | Analytics interface, local logging backend, structured diagnostic logging |
| Module structure | Clean layered packages, expect/actual interfaces for platform code |

### Can Be Mocked Now and Integrated Later

| Area | Mock Strategy | Integrates When |
|------|---------------|-----------------|
| File upload storage | Local device storage, mock URL returned | Backend ships `POST /files/upload` |
| Driver profile resolution | Mock `contactId` in `/me` response | Backend adds User↔Contact FK (G-17) |
| Remote analytics | Local log file, no external service | Analytics service selected and configured |
| Push notification tokens | Not registered; polling or manual refresh | FCM/APNs infrastructure is set up |

### Must Wait Until Later Business Features

| Area | Depends On |
|------|------------|
| Login screen UI | Driver Auth & Session epic |
| Trip data fetching and display | Driver Active Trip epic |
| Milestone stepper with real data | Driver Active Trip epic |
| POD capture full flow | Driver Active Trip epic |
| Earnings/ledger data | Driver Earnings epic |
| Offline-first persistence & queued mutations | Offline support epic (post-v1) |
| Deep link handling for push notifications | Push notification epic |
| Biometric auth | Future auth enhancement |

### Blocked by Backend or Product Uncertainty

| Area | Blocker | Foundation Impact |
|------|---------|-------------------|
| User↔Contact mapping strategy | Product/BE decision needed (add FK on User? on Contact? merge?) | Foundation proceeds with mock enrichment; real integration adjusts mapper when decision lands |
| File storage destination (S3, local FS, managed service) | Infra decision needed | Foundation uses mock local storage; real upload endpoint is a config-level change |
| Staging/production URLs | URLs not yet provisioned | Foundation uses placeholders in build config; swapped when available |

---

## Deferred Items (Explicitly Out of Scope)

| Item | Reason for Deferral |
|------|---------------------|
| Login screen and full auth UX | Belongs to "Driver Auth & Session" epic — foundation provides plumbing only |
| Any driver-facing business feature (trips, earnings, inspections) | Foundation provides infrastructure, not features |
| Offline-first data persistence and queued mutations | Architecturally significant; foundation shows offline visual state only |
| Push notification registration and handling | Requires FCM/APNs setup; deferred to push notification epic |
| Remote analytics service integration | Foundation provides the interface; service binding is a future task |
| Dark mode | Deferred per spec-002. Foundation theme supports single (light) theme |
| Tablet and landscape layouts | V1 targets phone portrait only per spec-002 |
| CI/CD pipeline for builds | Infrastructure concern managed separately |
| Automated testing framework setup (unit tests, UI tests) | Important but managed as a parallel effort, not a spec-003 deliverable |
| Backend endpoint implementation | Foundation uses existing endpoints only; new endpoints are backend team's scope |
| Multi-tenant or multi-branch configuration | Foundation uses single-tenant context from auth; multi-branch is a backend/product concern |
| Internationalization / localization | V1 ships in English only |
