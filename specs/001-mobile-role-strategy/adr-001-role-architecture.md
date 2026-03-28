# ADR-001: Role-Extensible Mobile Architecture

> **Status**: Accepted
> **Date**: 2026-03-28
> **Decision Makers**: Engineering team

## Context

AxleOps is a fleet management platform with multiple user roles (Driver, Operations Executive, Workshop Manager, etc.). The mobile app must:

1. Ship v1 with Driver role only
2. Support adding future roles without modifying existing code
3. Bridge backend API gaps with mock data until endpoints are ready
4. Share infrastructure (auth, settings, theme) across roles

## Decision

Adopt a **registry-driven, role-scoped architecture**:

- **RoleRegistry** — single source of truth for mobile-supported roles
- **RoleConfig** — data-driven tab structure per role (no hardcoded nav)
- **AuthShell** — role-agnostic scaffold consuming RoleConfig
- **DataSourceConfig** — per-feature mock/real toggle
- **Repository pattern** — interface + Real/Mock implementations

## Adding a New Role (Proven Path)

1. Add `RoleConfig` entry to `RoleRegistry` (~15 lines)
2. Create role-specific screen composables (~1 file)
3. Add routing case in `AppNavHost` (~1 line)
4. **Zero changes** to shared infrastructure

## Consequences

### Positive
- Role isolation — Driver code is never touched for OpsExec
- Mock-first development — features work before backend is ready
- Data-driven navigation — tabs configured via data, not code

### Risks
- Role configs are compile-time (no runtime role discovery)
- Icon resolution uses emoji text (placeholder until design system icon set)
