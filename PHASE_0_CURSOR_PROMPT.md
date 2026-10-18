# Cursor Prompt — Phase 0: Inspect, Understand and Plan (No Implementation Yet)

You are the technical planning partner for **SevaBridge**, an NGO Donation & Campaign Management prototype. The repository/workspace is currently empty. We are starting from scratch and have a strict target of approximately 3–4 hours for a demo-ready MVP, so scope discipline and phased execution are essential.

## Read these files first

1. `project_context_sevabridge.md` — the complete product requirements and source of truth.
2. `design/references/fundup-campaign-cards-reference.png`
3. `design/references/fundup-full-dashboard-reference.png`
4. `design/references/donation-form-functional-reference.png`

Inspect the actual images, not just their filenames. The first two are references for the FundUp dashboard’s composition and campaign-card hierarchy. The third is only a functional reference for a basic donation form; its pink theme is not our design direction. Do not copy the FundUp brand, data, donor leaderboard or map.

## Phase 0 objective

Produce a clear, dependency-aware implementation plan in phases **before writing application code**. Our goal in Phase 0 is understanding, architecture and planning—not building the app.

## Tasks

### 1. Confirm workspace state
- Inspect the directory and report what exists.
- Assume there is no application yet. Do not overwrite user files if anything unexpected exists.
- Identify any missing setup information that would block the first implementation phase.

### 2. Summarize your understanding
Briefly restate:
- What problem the product is intended to address.
- The two kinds of support: physical-item pledges and monetary pledges.
- The rule that there is no payment gateway and money/items are fulfilled offline.
- The critical donor-to-NGO-to-public-update workflow.
- The visual distinction between the public landing page and the NGO dashboard.

Do not broaden the scope beyond the context file.

### 3. Inspect and interpret the design references
Create a concise design analysis with separate notes for:
- Public landing page (derive this from the product requirements; do not assume the dashboard screenshot is a landing-page reference).
- NGO dashboard (layout, navigation, campaign cards, hierarchy, spacing, panels and relevant behaviours from the first two references).
- Pledge form (labels, fields and submission clarity from the third image; restyle in SevaBridge’s blue/white system).

State which aspects are appropriate to reuse and which are explicitly out of scope. Do not reproduce names, figures, imagery or brand identity from the reference screenshots.

### 4. Propose the simplest sound architecture
Evaluate the context’s proposed React + Vite + TypeScript + React Router + Supabase stack. Unless there is a concrete blocker, use it.

Describe:
- Frontend structure and routing.
- Supabase client and environment handling.
- Five-table data model: `organizations`, `campaigns`, `campaign_item_needs`, `commitments`, `campaign_updates`.
- Ownership and relationships.
- Public read access versus private NGO access.
- How public campaign progress can be aggregated without exposing individual commitment records or donor contact details.
- How a public pledge is inserted safely as `pending` and how the NGO later records fulfilment.
- The smallest reasonable mechanism for RLS, database constraints and public aggregate values.

Do not claim that hiding UI controls is a security solution. Do not expose a service-role key to the browser. Clearly flag any SQL/RLS decision that needs review before applying it.

### 5. Produce a phased implementation plan
Plan phases in a logical dependency order. Start with project setup and design tokens, then database/security, public flows, NGO flows, cross-flow integration, testing and deployment. You may use the phases in the context document as a starting point, but refine the order to reduce risk.

For **each phase**, specify:
- Objective.
- Exact tasks.
- Expected files/folders to create or modify.
- Dependencies on prior phases.
- A definition of done / verifiable acceptance checks.
- Likely failure points and the minimal recovery strategy.
- What should explicitly be deferred to protect the 3–4 hour scope.

Include a realistic time budget. Make it clear that the time is an estimate and that feature cuts should come from lower-priority polish, not privacy/security or the core workflow.

### 6. Propose a minimal repository structure
Recommend a small, maintainable structure for React/Vite/TypeScript. Organize by shared components and public/NGO features without excessive abstraction. Explain the purpose of major directories. Do not create the actual code or scaffold yet.

### 7. Provide setup prerequisites
List only the things the user must actually do or decide, such as:
- Node.js/npm availability.
- A Supabase project and its URL/anon key.
- How a first NGO demo account will be created without public registration.
- Whether to use sample image URLs initially and add real image upload later.
- Which environment variables are required.

Do not ask many questions if a sensible default is already defined in the context file. Clearly separate required blockers from optional choices.

### 8. Define an end-to-end verification checklist
Include the flow: NGO signs in → creates/publishes campaign → campaign appears publicly → visitor submits an item or monetary pledge → pledge is stored as pending → NGO reviews and marks received/fulfilled → public aggregate progress and published update change correctly.

Also include negative checks for privacy/access control, invalid values, cancelled pledges, refresh persistence and mobile layout.

## Important constraints

- **Do not implement the app in Phase 0.**
- Do not run `npm create vite`, install dependencies, create React components, generate SQL migrations or alter configuration yet.
- Do not make broad design assumptions that conflict with the context.
- Do not use generic AI-generated UI patterns: no gradient-heavy design, fake statistics, a global map, a donor leaderboard, decorative feature grids or non-functional buttons.
- Do not claim production readiness. This is a student MVP, but donor privacy and correct donation status are still mandatory.
- Prefer concise, concrete plans over vague advice.
- If the context contains a real ambiguity, call it out and propose a default rather than silently deciding.

## Deliverable

Create **only one planning document** at the project root named `IMPLEMENTATION_PLAN.md`. It should contain:
1. Your understanding of the product.
2. Design-reference analysis.
3. Architecture and key decisions.
4. Proposed file tree.
5. Phased plan with time budgets, dependencies and acceptance checks.
6. Setup prerequisites.
7. Risks and scope-cut order.
8. End-to-end test checklist.
9. Any unresolved decisions (ideally few).

Do not create or modify source code, package files, migrations or environment files. At the end, show the proposed phase order and ask for review/approval before beginning Phase 1. Stop there.
