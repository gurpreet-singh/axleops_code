# Frontend Architecture Specification: AxleOps (React)

## 1. Executive Summary
This document outlines the architectural specifications for converting the AxleOps pure HTML/JS demo application into a robust, scalable React-based Single Page Application (SPA). The frontend will support 8 departments, 19 roles, and over 70 distinct pages with complex data presentation, forms, and a ubiquitous right-slider detail pattern.

## 2. Technology Stack
*   **Core Framework**: React 18+
*   **Build Tool / Meta-Framework**: Vite (recommended for standard SPA) or Next.js (if SSR/SEO or API routes become necessary, though an SPA suits the dashboard context better).
*   **Routing**: React Router v6.
*   **State Management**: Zustand (for global UI state like the Right Slider, active role, branch context) + React Query (@tanstack/react-query) for server state management, caching, and background fetching.
*   **Styling**: the existing CSS tokens and classes mapped to CSS Modules or a utility-first framework like Tailwind CSS (optional, depending on migration speed). Since a custom CSS design system exists (`styles.css`), standard CSS / SCSS with CSS Modules is recommended to strictly encapsulate styles.
*   **Form Management**: React Hook Form combined with Zod for schema validation (crucial for complex forms like `WorkOrderCreate` and `TripCreate`).
*   **Mapping UI**: Mapbox GL JS or Google Maps API for live tracking, routing, and checkpoint visualization on trip details.
*   **Charts**: Recharts or Chart.js for dashboard KPIs (Replacing the current SVG charts).

## 3. Architecture & Layout Patterns

### 3.1 Application Shell
The application will utilize a high-level layout wrapper consisting of:
1.  **SidebarNavigation**: Dynamically renders links based on the authenticated user's Role and Department permissions.
2.  **TopHeader**: Contains the Global Search, Notification Bell, User Avatar, and the **Global Branch Selector** (restricted by RBAC).
3.  **MainContentArea**: The Router outlet where individual pages (dashboards, lists, forms) render.
4.  **RightSliderPanel**: A globally mounted component controlled by global state (Zustand), overlaid over the `MainContentArea`. It intercepts "View Detail" or "Quick Create" actions.

### 3.2 Right Slider Architecture
The Right Slider is a foundational UX pattern in the AxleOps demo.
*   **Implementation**: A global Context or Zustand store (`useSliderStore`) will manage the `isOpen`, `componentType` (e.g., `'TRIP_DETAIL'`, `'ADD_LABOR'`), and `payload` (e.g., `{ tripId: 'TRP-101' }`).
*   **Component Injection**: A master `<SliderContext />` at the root will lazy-load and render the appropriate component dynamically based on `componentType`.

## 4. Component Design System

The current UI patterns will be converted into reusable React components:

### 4.1 Atoms
*   `Badge`: Status pills (Active, Overdue, Exception) with color variants.
*   `StatusDot`: Visual indicators for tables and timelines.
*   `Avatar`: User and vehicle avatars (with fallback initials/emojis).
*   `Button`: Variants: Primary, Secondary, Danger, Ghost.
*   `Card`: Container for widgets with headers and content.

### 4.2 Molecules
*   `SearchDropdown`: Crucial custom component replacing native `<select>`. Requires fuzzy search, infinite scroll (for large datasets like Parts or Clients), and custom option rendering.
*   `SectionCard`: Used within the Right Slider and Detail pages. Includes an icon, title background color, and body.
*   `StatCard`: Dashboard KPI cards.
*   `ProgressBars`: For SLA countdowns and Compliance.

### 4.3 Organisms
*   `DataTable`: Highly reusable table component supporting server-side pagination, sorting, row-selection, and custom column rendering (for Status Badges and progress bars).
*   `KanbanBoard`: The Trip Dispatch Board. Implemented via `dnd-kit` for drag-and-drop state transitions.
*   `Timeline`: For Trip Milestones (10-step horizontal stepper and vertical event cards).

## 5. Security, RBAC & Context

### 5.1 Role-Based Access Control
*   The UI must enforce the 19 roles strictly.
*   **Route Guards**: React Router protected routes that check the `userRole` against allowed roles for a `Route` chunk.
*   **Component-Level RBAC**: A custom hook `usePermissions(action, resource)` to hide/disable buttons (e.g., "Assign Vehicle" is hidden if status is not 'Consignment' or role is not Ops).

### 5.2 Branch Context (X-AxleOps-Branch)
*   The Global "Branch Selector" in the top header will store the selected `branch_id` in React State.
*   An Axios Interceptor will automatically attach `X-AxleOps-Branch: <branch_id>` to all outgoing requests.
*   React Query keys must include the `branch_id` (e.g., `['trips', branchId, filters]`) to ensure data is invalidated and refetched when the user changes the branch context.

## 6. Page Mapping Strategy

The 73 pages map to parameterized React routes:
*   `/dashboard`: Dynamic import based on role (e.g., `<OwnerDashboard />` vs `<FleetManagerDashboard />`).
*   `/trips`: Resolves to `<TripList />` (toggleable List/Kanban).
*   `/trips/create`: Resolves to `<TripCreateFlow />` (Multi-step form wizard).
*   `/trips/:id`: Resolves to the `<TripDetail />` which registers the 8 tabs (Overview, Exceptions, Financials, Milestones, etc.).
*   `/vehicles/:id`: Tabbed `<VehicleDetail />` with deeply nested routing (e.g., `/vehicles/:id/compliance`).

## 7. Performance Considerations
*   **Code Splitting**: Route-level code splitting using `React.lazy()` to ensure the initial bundle size stays small despite having 70+ screens.
*   **Memoization**: Heavy data tables and graphs should be wrapped in `React.memo` to prevent re-rendering when global context (like the sliding panel toggle) changes.
*   **Optimistic Updates**: Using React Query to immediately update the UI on state transitions (e.g., Kanban drag-and-drop), rolling back only if the server responds with an error.
