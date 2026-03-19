# Lotovibe - Source of Truth

## Purpose

This document is the source of truth for the `Lotovibe` frontend demo. It defines the confirmed business, product, UX, and technical decisions for the initial private SaaS demo focused on lottery agency management.

## Confirmed Decisions

### Product Identity

- Name: `Lotovibe`
- Product type: private SaaS platform for managing lottery agencies
- Branding: use the name `Lotovibe`; do not create a logo or a full branding system yet

### Business Scope

- Coverage: 1 province
- Network size: 25 agencies
- The platform is used to monitor agencies, collections, debt exposure, and performance
- The balance represents what each agency owes
- Each agency has a configurable cap limit
- There is a configurable province percentage, with `30%` as the reference example
- Transfers are entered manually by agency, date, and amount
- Each transfer reduces the agency balance
- Data arrives daily, but operational calculations are consolidated every 3 days

### Frontend Demo Scope

- Type: frontend demo
- Stack: React + Vite + TypeScript + shadcn/ui + Zustand + Recharts + React Router
- Data strategy: automatic mock data simulation plus manual transfer entry
- Authentication: hardcoded login only
- Roles: no role model for now
- Session model: in-memory session with optional temporary persistence in `sessionStorage`

### Required Screens

- Login
- Executive dashboard
- Collections dashboard
- Performance dashboard
- Agency list
- Agency detail
- Configuration
- Transfers

## Final Business Rules

The following rules are definitive for the executive demo and replace any previous pending or provisional definitions.

### Balance Formula

- The balance represents what the agency owes
- Every 3 days, the platform consolidates one operational period
- For each period, the base amount owed is calculated from period sales multiplied by the applicable province percentage
- Transfers registered for the agency reduce that balance
- Demo formula: `balance = accumulated debt from consolidated periods - accumulated transfers`

### Cap Rule

- Each agency has a configurable sales cap
- If the agency reaches or exceeds the cap in the consolidated period, the agency improves its commission
- In the demo, this must appear as a visible incentive in dashboards and in the agency detail view
- The demo does not need a complex accounting settlement model; a clear and consistent mock percentage improvement is enough

### Province Percentage Rule

- There is a global default province percentage
- Each agency may define an optional individual override
- If an agency has no override, the global percentage applies

## Executive Demo Rationale

These decisions are appropriate for an executive demo because they keep the business logic credible, easy to explain, and consistent across dashboards without introducing accounting complexity that would distract from product value.

## Conceptual Data Model

The frontend demo should operate with a simple conceptual model that is easy to mock and easy to evolve later.

### Core Entities

#### Agency

- `id`
- `code`
- `name`
- `province`
- `status`
- `capLimit`
- `provincePercentage`
- `currentBalance`
- `lastConsolidationDate`

#### Transfer

- `id`
- `agencyId`
- `date`
- `amount`
- `notes` (optional)
- `createdAt`

#### Operational Snapshot

- `id`
- `agencyId`
- `periodStart`
- `periodEnd`
- `dailySales`
- `consolidatedSales`
- `provinceAmount`
- `generatedDebt`
- `transfersApplied`
- `balanceAfterConsolidation`

#### Configuration

- `provinceName`
- `defaultProvincePercentage`
- `consolidationFrequencyDays`
- `sessionPersistenceEnabled`
- `currency`

### Derived Views

- Executive KPIs across all 25 agencies
- Collections status by agency and aging/risk level
- Performance ranking by sales, balance evolution, and cap usage
- Transfer history filtered by agency and date

## Routes and Screens

The demo should expose clear product navigation based on the required screens.

### Routes

- `/login`
- `/dashboard/executive`
- `/dashboard/collections`
- `/dashboard/performance`
- `/agencies`
- `/agencies/:agencyId`
- `/configuration`
- `/transfers`

### Screen Intent

#### Login

- Hardcoded access for demo purposes
- Minimal friction entry point
- Optional session restore from `sessionStorage`

#### Executive Dashboard

- Portfolio overview
- Total debt exposure
- Transfer volume
- Agencies near or above cap
- High-level trend charts

#### Collections Dashboard

- Outstanding balance by agency
- Recent transfers
- Collection follow-up priorities
- Filters by agency and date window

#### Performance Dashboard

- Agency ranking
- Sales and balance trends
- Cap attainment visibility
- Comparative charts for top and bottom performers

#### Agency List

- Searchable and scannable list of the 25 agencies
- Key metrics per row
- Entry point to detail view

#### Agency Detail

- Agency profile
- Balance evolution
- Transfer history
- Cap and province percentage settings
- Consolidation summary

#### Configuration

- Province percentage setup
- Consolidation frequency visibility
- Agency cap management
- Demo behavior toggles when needed

#### Transfers

- Manual transfer registration
- Filters by agency and date
- Transfer ledger style visualization

## Visual Direction

The demo should communicate a premium fintech feel, with a private, high-end operational product tone.

### Visual Principles

- Premium fintech / high-end aesthetic
- Clean, intentional layout system
- Strong hierarchy for money, debt, and operational risk
- Executive readability first, not playful consumer styling
- Refined data visualization with restrained motion

### UI Direction

- Sophisticated neutral base with selective accent color usage
- Dense but elegant dashboard composition
- Strong typography contrast for KPIs and section headers
- Cards, tables, and charts should feel polished and credible
- Avoid generic startup branding patterns and avoid full brand development for now

## Demo Behavior Rules

- Mock data should be simulated automatically to populate dashboards and agency views
- Manual transfers must be added through the UI and immediately reflected in balances
- Daily incoming data should exist in the model, but visible operational totals should align with 3-day consolidation logic
- Balance calculations must follow the definitive rule: consolidated period debt minus accumulated transfers
- Cap attainment must trigger a visible mock commission improvement in dashboards and agency detail
- Province percentage resolution must use agency override first and global default otherwise
- Login remains hardcoded for the demo phase only
- No role-based access control is included in this version

## Delivery Intent

This document is the current project source of truth for the `Lotovibe` demo. Any product, UX, data, or implementation decision that conflicts with this file should be treated as out of scope unless it is explicitly revised here first.
