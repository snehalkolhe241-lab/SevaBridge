# SevaBridge — Product Context & Implementation Source of Truth

**Document version:** 1.0  
**Project type:** UHV FA2 community-service prototype  
**Primary goal:** Build a polished, working NGO campaign and donation-commitment management web application from an empty workspace.  
**Time constraint:** Aim for a demo-ready MVP in approximately 3–4 hours with AI coding assistance. This is a scope target, not a guarantee.  
**Working product name:** SevaBridge (name can be changed later).

---

## 1. Product overview

SevaBridge is a web platform where NGOs can publish community-support campaigns, explain what they need, accept **non-binding commitments** for physical items or money, record offline fulfilment, and publish progress updates. Visitors can discover campaigns without creating an account.

The platform supports two kinds of contributions:

1. **Physical items and supplies** — for example books, stationery, clothes, food staples or other campaign-specific needs. The donor commits to an item and quantity, then coordinates the actual handover with the NGO offline.
2. **Monetary pledges** — visitors record an intended amount. There is **no payment gateway and no online collection of money**. The NGO coordinates and confirms any real transfer or handover outside SevaBridge.

The core value is not simply listing campaigns. It is helping supporters understand current needs and giving NGOs a clear way to report what has been pledged, what has actually been received, and what changed after an activity.

### Problem framing (a hypothesis to validate)

People may be willing to help but have difficulty discovering current NGO needs and following up on the outcome of their support. NGOs may need a simple, consistent way to communicate campaign needs and record commitments and updates. This should be validated with at least one real NGO before claims about impact are made.

### Project context

This is a student UHV FA2 prototype. It should demonstrate a practical community-service workflow and be realistic to build from scratch quickly. Sample records must be clearly treated as demonstration data unless an actual NGO has agreed to participate. Do not invent endorsements, verified-partner badges, impact claims or real donation figures.

---

## 2. Product principles

1. **Real workflow over feature count.** A campaign must be publishable, visible publicly, receive a persisted commitment, allow the NGO to update its status, and show a public progress update.
2. **Trustworthy status and numbers.** A pledge is not a received donation. UI labels, calculations and analytics must reflect this distinction.
3. **Deliberate, coherent design.** The application should look like a carefully designed product, not a generic AI-generated landing page.
4. **No unnecessary complexity.** No payments, chat, public donor accounts, complex role system, AI, maps, donor leaderboard, or advanced analytics in the first version.
5. **Useful states.** Every key page needs loading, empty, validation, success and failure states as appropriate. Avoid non-functional buttons and fake interactions.
6. **Privacy by design.** Donor contact information is private to the owning NGO and never available through public queries or UI.
7. **Responsive by default.** The public website and NGO console must remain usable on mobile and desktop.
8. **Preserve the working application.** After implementation begins, work in stages, run checks after each stage and avoid replacing the entire codebase to fix a local problem.

---

## 3. Technology and architecture

### Preferred stack

- **Frontend:** React + Vite + TypeScript
- **Routing:** React Router
- **Database and authentication:** Supabase (PostgreSQL + Supabase Auth)
- **Data client:** `@supabase/supabase-js`
- **Icons:** `lucide-react`, used consistently and sparingly
- **Styling:** CSS variables/design tokens and component styles. Use plain CSS or a lightweight styling approach that Cursor can maintain easily. Do not add a heavy UI kit without a clear reason.
- **Hosting target:** Vercel or another suitable static frontend host after local workflows work.

Do not add a separate FastAPI backend for the MVP. Supabase covers the basic database and authentication needs. If a secure server-side operation is required, propose the smallest appropriate Supabase SQL function/RPC or Edge Function and explain why.

### Required engineering practices

- TypeScript types for core entities and form data.
- Reusable components rather than duplicated markup for buttons, cards, fields, badges, progress bars, tables, dialogs and feedback messages.
- Keep components reasonably small and organised by feature.
- Centralise environment configuration and the Supabase client.
- Add `.env.example` with placeholder variable names only. Never add real keys or credentials to source control.
- Do not expose a Supabase service-role key in browser code.
- Use explicit loading/error/empty states; don't swallow errors or claim a save succeeded until the database confirms it.
- Add a concise `README.md` with setup instructions and demo configuration requirements.
- Use meaningful HTML semantics, labels on form controls, keyboard-accessible actions and visible focus states.

---

## 4. Information architecture and routes

Build the following eight page templates. Create and edit campaign use the same reusable form. Related actions can live inside tabs on one workspace page to keep the scope manageable.

### Public area

#### 4.1 Landing page — `/`

**Purpose:** Explain the platform quickly and send visitors toward real campaigns.

**Structure, in order:**
1. Header/navigation: SevaBridge wordmark; Explore Campaigns; How It Works; NGO Login. On narrow screens, collapse navigation into an accessible menu.
2. Hero section: headline such as “Make support matter beyond the promise.” Supporting line explaining that visitors can discover community needs, pledge support and follow updates. Primary CTA “Explore campaigns”; secondary CTA “For NGOs”. Use one relevant, authentic-feeling community image or a featured campaign image. Avoid oversized decorative shapes and fake metrics.
3. Featured campaigns: ideally three cards. Use real active records where available, or clearly labelled demonstration records. Each card has image, category, title, NGO name, short description, campaign status, and a relevant indicator. Only show money progress if monetary support is enabled and only calculate “received” progress from fulfilled records.
4. Browse by need: compact categories such as Education, Food & Essentials, Healthcare, and Community Development. Selecting a category filters/navigates to the directory.
5. Latest campaign updates: a small feed of recent published updates, each linking to the corresponding campaign.
6. How it works: three clear steps — NGOs publish needs; people pledge money or items; NGOs report progress/fulfilment.
7. Footer: brief product summary, campaign navigation and NGO login. Do not invent addresses, contact details or partner logos.

The landing page is public and content-led. It must not look like an admin dashboard or a pitch-deck slide.

#### 4.2 Campaign directory — `/campaigns`

**Purpose:** Let visitors find a relevant campaign.

**Required content and interaction:**
- Page title and short explanatory sentence.
- Search campaigns by title and, where easy, NGO name/description.
- Filters for category, support type (`items`, `money`, `both`) and campaign status; default to active/published campaigns.
- Campaign cards with consistent image ratio, category, title, NGO name, deadline if provided, concise description, and a progress summary appropriate to its type.
- Clear no-results state with a way to reset filters.
- Clicking a card opens `/campaigns/:id`.
- No fictional sorting controls unless they actually work.

#### 4.3 Public campaign details — `/campaigns/:id`

**Purpose:** Give visitors enough context to decide how to help.

**Content:**
- Campaign cover image, title, category and NGO attribution.
- Description: the need, purpose and intended use of support.
- Campaign status and deadline if set.
- Monetary goal and separate **Pledged** and **Received** figures for monetary campaigns.
- Item needs list showing item name, requested quantity, and quantity received; do not overstate outstanding/received figures.
- Published progress updates in reverse chronological order.
- Clear donation commitment area with two modes when the campaign supports both.
- Public NGO information limited to fields intended for public display.

**Item pledge form:** donor name, at least one contact method, selected item need, positive quantity, optional message. The selected item must belong to this campaign.

**Monetary pledge form:** donor name, at least one contact method, positive amount, optional message. Clearly state that this records a pledge only; it does not transfer money online.

**Behaviour:** On valid submission, create a `pending` commitment and show a confirmation message explaining that the NGO may contact the donor to coordinate offline fulfilment. Do not expose the new record’s private contact details through the public page.

Provide graceful not-found, closed/completed campaign and submission-error states. Prevent new pledges to campaigns that are not accepting support.

### NGO console

The NGO console should have its own authenticated shell: slim persistent sidebar on desktop, clear active navigation, a compact top bar, and responsive behaviour on mobile.

#### 4.4 NGO login — `/ngo/login`

- Simple, professional sign-in card with email and password.
- Inline validation and readable authentication errors.
- On success, route to `/ngo/dashboard`.
- Redirect unauthenticated visitors from protected routes to the login page and return them to the intended route after sign-in where practical.
- Do not implement public NGO self-registration in this MVP. The first demo account and its organization should be configured manually through Supabase setup instructions.
- Provide sign-out from the console.

#### 4.5 NGO dashboard — `/ngo/dashboard`

**Purpose:** A useful overview for a small NGO operator.

**Layout:**
- Desktop: top header, slim left sidebar, main content area. Avoid overcrowding.
- Page heading “Dashboard” or “Your campaigns” and a prominent “New campaign” action.
- Four compact metrics: active campaigns, pending commitments, monetary amount received, and items received/fulfilled. Label each metric accurately and derive it from the authenticated NGO’s records. No fabricated global statistics.
- Recent/active campaign cards or compact rows. Each item includes image, title, status, donation mode and a “Manage campaign” action.
- A compact recent activity or latest updates section if time permits.
- Useful first-use state if there are no campaigns.

Do not copy FundUp’s donor rankings, worldwide donor map or financial claims: those are not relevant to this prototype. Prioritise the NGO’s needs and fulfilment work.

#### 4.6 NGO campaign list — `/ngo/campaigns`

- List all campaigns owned by the signed-in NGO, including draft, active, completed and archived.
- Search/filter can be basic but must work if included.
- Display category, donation mode, status and last-updated date.
- Actions: create new, edit, open management workspace, publish/unpublish where appropriate, mark complete, archive.
- Confirm destructive or consequential status changes.
- Ensure all operations are limited to the signed-in owner’s organization.

#### 4.7 Create/edit campaign — `/ngo/campaigns/new` and `/ngo/campaigns/:id/edit`

Use one reusable form for create and edit.

**Fields:**
- Title (required)
- Short summary (required; set reasonable max length)
- Full description (required)
- Category (required)
- Donation mode: items, money or both
- Cover image URL (optional for MVP; use a safe fallback image if absent)
- Monetary target (required if money/both; positive amount)
- Deadline (optional)
- Item needs (required if items/both): one or more rows, each with item name, description (optional), required quantity, and unit
- Status/publish action: save draft or publish

**Behaviour:** Validate inputs, save campaign and item needs consistently, show loading/error/success feedback, prevent duplicate submissions, and navigate to the created/updated campaign. Editing must preserve existing data and handle removed/updated item needs predictably.

For time control, use image URLs rather than building full file upload/storage unless the core app is already complete.

#### 4.8 NGO campaign workspace — `/ngo/campaigns/:id`

Use a tabbed/sectioned workspace rather than building more separate screens. Include:

- **Overview:** title, status, mode, deadline and high-level progress.
- **Commitments:** records for this campaign with pledge type, donor name, item/amount, created date and status. Only the owning authenticated NGO can view donor contact details. Allow status transitions between pending, confirmed, fulfilled/received and cancelled using validated actions.
- **Item needs:** view and manage item needs where practical; do not permit an existing commitment to silently point at a deleted need.
- **Updates:** list published updates and a form to create/publish a new update. An update must appear on the public campaign page after it is saved.
- **Edit campaign:** navigate to the reusable edit form.

Keep fulfilment terminology clear. In the stored model, `fulfilled` can be labelled “Received” in the UI. For a monetary pledge, this means the NGO confirmed offline receipt; for an item pledge, it means the items were handed over.

---

## 5. Visual design direction

The user explicitly wants a thoughtful, clean product design—similar in polish and layout discipline to the supplied FundUp dashboard references and prior SmartStock work. Avoid generic AI-generated styling.

### Overall art direction

- Calm, professional, community-oriented and practical.
- White and very light grey surfaces; dark readable text; restrained blue as the primary accent.
- Consistent alignment, spacing, typography, image crops and card layouts.
- Borders and subtle shadows used sparingly; no excessive decorative effects.
- Use authentic-looking campaign photography with consistent crop treatment, not random illustrations on every card.
- Use Lucide icons consistently; don't use emoji as interface icons.
- Every section should have a function. Avoid meaningless statistics, filler paragraphs, excessive feature cards and unnecessary animations.

### Starting design tokens

Treat these as an initial direction, not hard requirements if a contrast/accessibility check requires slight adjustments:

- `--color-bg`: `#F3F6F8`
- `--color-surface`: `#FFFFFF`
- `--color-ink`: `#192332`
- `--color-muted`: `#667385`
- `--color-primary`: `#4E78E5`
- `--color-primary-hover`: a slightly darker blue checked for contrast
- `--color-border`: `#DDE5ED`
- `--color-soft-blue`: `#EAF0FF`
- `--color-success`, `--color-warning`, `--color-danger`: muted, accessible semantic status colours

Use a coherent sans-serif family, sensible responsive typography and consistent spacing tokens. Do not mix unrelated font styles. Avoid gradients as a default visual treatment, glassmorphism, excessive pill controls, giant rounded cards and decorative stats floating in the hero.

### Landing page vs dashboard

The landing page should be editorial, welcoming and campaign-led. The dashboard should be information-dense but calm and structured. They share colours, typography, buttons and cards, but they do not share the same page layout.

### Dashboard references

Two supplied references show a FundUp-style dashboard:
- `design/references/fundup-campaign-cards-reference.png`
- `design/references/fundup-full-dashboard-reference.png`

Use these images to study the **layout and visual hierarchy**: compact top header, narrow icon sidebar, campaign cards with images/status labels, outlined actions, restrained blue accents, lower data panels and consistent spacing.

Do **not** copy the FundUp brand, campaign titles, donor names, amounts, flags, map, leaderboard or irrelevant functionality. Translate only the relevant layout principles into SevaBridge’s needs. Dashboard components should prioritise campaigns, pending commitments and confirmed fulfilment.

### Donation form reference

- `design/references/donation-form-functional-reference.png`

This is a functional reference for a straightforward donation form (fields, labels, select input and a clear submit action). Its pink visual style is **not** the chosen SevaBridge style. Rebuild the form in the shared white/light-grey/blue design system and adapt it for separate item and monetary pledge modes.

### Image and content guidance

- Keep image aspect ratios consistent within each card group.
- Use local placeholders or safe fallback images when image URLs fail.
- Don't rely on remote images for critical UI layout.
- Sample campaigns must be visibly identified as demo/sample content in developer/demo context; never imply a real NGO or confirmed impact without evidence.

---

## 6. Minimal Supabase data model

Use UUID primary keys, `created_at` timestamps, suitable foreign keys, check constraints and indexes for commonly filtered columns. Add `updated_at` where records change. Let Cursor propose a migration that satisfies these semantics and review it before applying.

### 6.1 `organizations`

- `id` UUID primary key
- `owner_user_id` UUID references `auth.users.id`, unique for the v1 one-owner-per-NGO model
- `name` required
- `description` public description, optional
- `public_contact_email` optional, explicitly intended for public display
- `logo_url` optional
- `created_at`

### 6.2 `campaigns`

- `id` UUID primary key
- `organization_id` UUID references `organizations.id`
- `title` required
- `summary` required
- `description` required
- `category` constrained to a small agreed enum/text set: `education`, `essentials`, `healthcare`, `community`
- `campaign_mode` constrained to `items`, `money`, `both`
- `cover_image_url` optional
- `money_goal` numeric, positive when money is enabled; nullable otherwise
- `deadline` optional date
- `status` constrained to `draft`, `active`, `completed`, `archived`
- `created_at`, `updated_at`

### 6.3 `campaign_item_needs`

- `id` UUID primary key
- `campaign_id` UUID references `campaigns.id`
- `item_name` required
- `description` optional
- `quantity_needed` positive numeric/integer appropriate to the supported use case
- `unit` required (for example pieces, sets, boxes or kilograms)
- `created_at`, `updated_at`

### 6.4 `commitments`

- `id` UUID primary key
- `campaign_id` UUID references `campaigns.id`
- `commitment_type` constrained to `item` or `money`
- `item_need_id` nullable reference to `campaign_item_needs.id`
- `donor_name` required
- `donor_email` optional
- `donor_phone` optional
- `amount` numeric, nullable
- `quantity` numeric/integer, nullable
- `message` optional
- `status` constrained to `pending`, `confirmed`, `fulfilled`, `cancelled`; initial status must always be `pending`
- `created_at`, `updated_at`
- `fulfilled_at` nullable timestamp

Database/business validation must ensure:
- At least one donor contact method is provided.
- Money commitments have a positive amount and no item need/quantity.
- Item commitments have a valid need and positive quantity and no monetary amount.
- The chosen item need belongs to the same campaign as the commitment.
- The commitment type is compatible with the campaign mode.
- New public commitments are always pending.
- Public commitments can only be inserted for eligible active campaigns.

### 6.5 `campaign_updates`

- `id` UUID primary key
- `campaign_id` UUID references `campaigns.id`
- `title` required
- `body` required
- `image_url` optional
- `created_by` UUID references `auth.users.id`
- `created_at`
- `published_at` nullable timestamp (non-null when published)

### Relationships

- Organization 1 → many campaigns.
- Campaign 1 → many item needs.
- Campaign 1 → many commitments.
- Campaign 1 → many updates.
- Item commitment → one item need.
- Every NGO-owned record must be authorisable through the organization/campaign ownership relationship.

No donor account/table is required for v1. A donor submits a pledge without registering or logging in.

---

## 7. Correct progress calculations

Never maintain separate hand-edited totals that can drift from commitment records. Calculate totals from commitments using safe queries or an appropriately protected aggregate SQL function/view.

- **Money pledged:** sum `amount` for money commitments not cancelled (pending + confirmed + fulfilled), clearly labelled pledged/committed.
- **Money received:** sum `amount` for money commitments in `fulfilled` status only.
- **Items pledged:** sum `quantity` for item commitments not cancelled.
- **Items received:** sum `quantity` for item commitments in `fulfilled` status only.
- **Pending commitments:** count records in `pending` status.
- **Money goal progress:** use received amount divided by the goal, not amount merely pledged. Cap the visual progress bar at 100%, while the visible amount can show the actual value.
- **Item progress:** received quantity divided by needed quantity. Handle zero/missing needs safely.

Public pages must not query or expose individual commitment rows to get these totals. Use a narrowly scoped aggregate-only query, secure SQL function/RPC or equivalent mechanism that returns only public aggregate values. NGO owners can access individual commitment records only for their own organization's campaigns.

Use Indian rupee formatting (₹, Indian numbering) for monetary amounts in the UI. Be clear that monetary pledges are coordinated and received offline.

---

## 8. Security, privacy and validation

This is a prototype, but basic access boundaries are mandatory.

1. Enable Row Level Security (RLS) on all tables exposed through Supabase APIs.
2. Public users can read published/active campaign fields, public organization fields, item needs for public campaigns, published updates, and aggregate progress only.
3. Public users may insert a valid pending commitment for an active campaign through tightly scoped policies or a validated RPC/Edge Function. They must not select/list commitments or donor contact data.
4. Only the authenticated owner can create/edit/archive their organization's campaigns and manage associated item needs, commitments and updates.
5. Enforce ownership at the database layer using joins/`exists` checks or equivalent policy logic; hiding buttons in the client is not security.
6. Never bundle a service-role key in browser code. Use only the anon/publishable key on the client.
7. Keep donor contact information private to the relevant authenticated NGO and out of logs, public metrics and public responses.
8. Validate all form values client-side for usability and database-side for correctness. Do not trust client-provided amount, campaign mode, status or ownership.
9. Prevent a public submitter from setting a commitment status other than `pending` or an arbitrary `fulfilled_at` value.
10. Use a minimal anti-spam measure such as a honeypot and/or rate-limiting strategy appropriate to the chosen architecture, without letting this consume the MVP build window.
11. Provide a `.env.example` with placeholders and keep actual credentials out of commits/screenshots.

If direct anonymous inserts make validation or anti-spam unsafe, propose a small server-side endpoint/RPC and explain the trade-off. Prefer the simplest secure pattern rather than a complex architecture.

---

## 9. Status and wording conventions

Use consistent language throughout the UI:

- Campaign statuses: Draft, Active, Completed, Archived.
- Commitment stored status `pending`: display **Pending**.
- `confirmed`: display **Confirmed** (NGO has acknowledged/coordinated it; not necessarily received).
- `fulfilled`: display **Received** or **Fulfilled** depending on context; describe it as actually received offline.
- `cancelled`: display **Cancelled**.

Avoid misleading text such as “donation completed” immediately after a pledge form. Confirmation should say that the pledge was recorded and that the NGO may contact the person to coordinate offline fulfilment.

---

## 10. Scope exclusions for v1

Do not build these unless the core workflows, security and responsive UI are complete:

- Payment gateway, wallet, bank integration or collecting money online.
- Public donor accounts or profiles.
- NGO public registration, multi-staff roles or invitation management.
- Live chat, messaging inbox, email/SMS notifications.
- AI recommendations, chatbot, blockchain or token systems.
- Global maps, donor leaderboards, country breakdowns or vanity statistics.
- Complex analytics pages, PDF exports, barcode/QR scans or inventory management.
- Full file-upload storage. Cover image and update image URLs are sufficient for the MVP.
- Elaborate campaign approval workflow or formal NGO verification claims.

---

## 11. Quality and acceptance criteria

The MVP is demo-ready only when the following end-to-end checks pass:

1. An NGO owner signs in successfully.
2. The NGO creates and publishes a campaign with its mode, monetary goal if applicable, and item needs if applicable.
3. The active campaign appears in the public directory and can be opened from the landing page.
4. A public visitor submits an item pledge with a valid item/quantity, or a monetary pledge with a valid amount.
5. The record persists in Supabase with status `pending`.
6. The public visitor cannot list/read any other commitment or donor contact information.
7. The owning NGO sees the commitment and can change its status through permitted transitions.
8. A `fulfilled` status updates the relevant received totals and progress display.
9. The NGO publishes a campaign update, and the public campaign detail page displays it after refresh.
10. A different or unauthenticated user cannot modify this NGO's campaigns or read its private commitments.
11. Refreshing or reopening the site preserves database-backed data.
12. Common forms display validation, loading, success and failure states.
13. The app runs locally from a documented command and does not have TypeScript/build/runtime errors.
14. Main pages remain usable on narrow mobile screens and desktop.
15. Demo data is labelled as sample/demo where appropriate and is not presented as verified real-world impact.

Visual polish matters, but if time becomes constrained, preserve the core workflow and database/security correctness before adding secondary sections.

---

## 12. Recommended implementation sequence (planning target)

Cursor must first create a detailed implementation plan and must not immediately generate the entire application.

Suggested phases:

- **Phase 0 — Discovery and plan only:** Inspect the empty workspace, read this context, inspect the three design references, settle technical assumptions, produce an implementation plan with file structure, data/security strategy, phase dependencies, acceptance tests and risk list. No app implementation yet.
- **Phase 1 — Foundation:** Scaffold React/Vite/TypeScript, dependencies, route skeleton, global design tokens, shared layout/components, Supabase client, environment example and README.
- **Phase 2 — Supabase schema and policies:** Create migration SQL for the five tables, constraints, relationships, indexes, RLS policies and safe public aggregate mechanism; document applying it and creating the demo NGO owner.
- **Phase 3 — Public experience:** Landing page, campaign directory, campaign detail, published updates and functional pledge forms using persisted data.
- **Phase 4 — NGO experience:** Login, protected routes, dashboard, campaign list and create/edit form.
- **Phase 5 — Campaign operations:** Commitment review/status changes, updates composer/publishing and recalculated progress.
- **Phase 6 — Hardening and visual refinement:** Test all workflows, repair mobile layouts, validate errors and access policies, review console/build logs, deploy if stable.

The phases can be adjusted after inspection, but do not change the product scope casually. Identify dependencies and define a working checkpoint at the end of every phase. Each phase should finish with the app still runnable.

---

## 13. Design references included with this context

See the `design/references/` folder:

1. `fundup-campaign-cards-reference.png` — close-up reference for dashboard campaign cards and sidebar.
2. `fundup-full-dashboard-reference.png` — full dashboard reference for layout density and panel hierarchy.
3. `donation-form-functional-reference.png` — reference for a simple donation form layout only; do not copy its pink style.

Cursor should inspect these image files directly. Treat them as visual guidance, not as content to reproduce pixel-for-pixel. Build SevaBridge’s own interface and use only the relevant design principles.

---

## 14. Instructions to AI coding tools

- Treat this file as the project's product source of truth.
- If a requirement conflicts with a faster shortcut, explain the trade-off and prefer the requirement that preserves privacy, accurate progress reporting and the core workflow.
- Do not invent features, integrations, users, organizations or real impact metrics.
- Do not start coding until the Phase 0 implementation plan has been reviewed.
- Implement one phase at a time; summarize changed files, checks run, results, remaining risks and exact next step at the end of each phase.
- Keep code understandable for a student learning full-stack development; explain unusual decisions in concise comments or the README.
- Avoid broad rewrites after the first successful build. Fix the smallest relevant area and rerun checks.
