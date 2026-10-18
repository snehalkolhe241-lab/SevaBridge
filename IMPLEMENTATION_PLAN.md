# SevaBridge — Implementation Plan

**Status:** Phase 1 source is written and not yet installed or verified. Visual direction was revised on 18 October 2026. Do not start a UI redesign until this revision is approved.  
**Source of truth:** `project_context_sevabridge.md` for product scope. `DESIGN_REFERENCE_AUDIT.md` for visual decisions.  
**Estimate:** about 4 hours of implementation. That is an estimate. If time slips, cut polish from [Risks and scope-cut order](#7-risks-and-scope-cut-order). Do not cut donor privacy, pledge status rules, or the core workflow.

## Where the work stands

| State | Items |
| --- | --- |
| Done in source | Vite config, `package.json`, routes for all eight pages, design tokens, shared controls, public and NGO shells, placeholder pages, lazy Supabase client, entity types, `.env.example`, `.gitignore`, README |
| Written, not verified | `npm install` was interrupted. There is no `node_modules` and no production build. The app has not been opened in a browser |
| Leave as-is until data exists | Route table, `RequireAuth` (always logged out), `types.ts`, `src/lib/supabase.ts`, form and progress components |
| Adjust after this revision is approved | Tokens (card radius, one webfont), public landing hierarchy, then a shared campaign card when Phase 3 has records. Do not throw away the shells |
| Not started | SQL, RLS, live queries, pledge insert, NGO sign-in, fulfilment, deploy |

---

## 1. Workspace state

Present:

- Planning: `project_context_sevabridge.md`, `PHASE_0_CURSOR_PROMPT.md`, `IMPLEMENTATION_PLAN.md`, `DESIGN_REFERENCE_AUDIT.md`
- Local screenshots in `design/references/`
- App source under `src/`, plus `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `public/favicon.svg`, `public/fallback-cover.svg`
- `.env.example` and `.gitignore`
- `README.md` with local run steps

Not present: `node_modules`, `package-lock.json`, `.env.local`, `supabase/migration.sql`, or a Supabase project.

Local toolchain: Node `v24.19.0`, npm `11.17.0`.

Blockers before Phase 1 can talk to a database (not before scaffolding):

- A Supabase project, its project URL, and its anon (publishable) key
- Auth setting: public sign-up disabled, email confirmation off or the demo user pre-confirmed
- One demo user created in Supabase Auth, then one `organizations` row inserted in the SQL editor (the app will not offer NGO registration)

No service-role key will be placed in the repo or in frontend env.

---

## 2. Product understanding

SevaBridge is a student community-service prototype. It gives an NGO one place to publish what it needs, and gives visitors a way to discover those needs and follow what happened afterward. The problem it is meant to test: people may want to help but cannot see current needs or the outcome, and NGOs lack a simple record of pledges versus what was actually received.

Two kinds of support:

- **Items.** The visitor pledges an item and a quantity. Handover happens offline with the NGO.
- **Money.** The visitor records an intended amount in rupees. SevaBridge does not take payment. There is no gateway, wallet, or online collection. The NGO confirms any real transfer outside the app.

A pledge is not a received donation. New pledges are stored as `pending`. The NGO may mark them confirmed (acknowledged, not necessarily received), received (`fulfilled` in the database), or cancelled. Public money progress uses **received** amounts only. Pledged totals stay visible and are labelled as pledges.

Critical path: NGO signs in → creates and publishes a campaign → a visitor finds it and submits an item or money pledge → the row is `pending` and the visitor cannot read other pledges or contact details → the NGO reviews it and marks it received → public received totals change → the NGO publishes an update → the public campaign page shows that update.

Visual split: the public site (`/`, `/campaigns`, `/campaigns/:id`) is editorial and campaign-led. The NGO console (`/ngo/...`) is a calm, denser workspace with its own shell (slim sidebar, top bar, main panel). They share colour, type, buttons, and cards. They do not share a layout.

Out of product scope for v1: payments, donor accounts, NGO self-registration, multi-staff roles, chat, email/SMS, maps, leaderboards, analytics, file upload, and verification badges.

---

## 3. Design direction

Live notes are in `DESIGN_REFERENCE_AUDIT.md`. Short version:

- Public pages learn from Give.do: photography first, a short headline, category navigation as text, no impact statistics.
- Campaign cards learn from Ketto’s list cards: photo, title, two honest figures, a thin received-progress bar, one action. The Ketto story page and donate form were not opened, so the detail layout still comes from the product requirements.
- The NGO console keeps the FundUp shell already built (sidebar, top bar, dense main area). Bloomerang’s public site is a marketing page, and its product tour is behind a lead form. It is not a template for our console.
- Palette stays blue and white. Primary is `#3E63D4` so button and link text clear 4.5:1. Card radius 12px. Control radius 8px. One sans family.

## 3a. Earlier reference notes

Tokens to start from (Phase 1 may darken the blue if white-on-blue or blue-on-white text fails WCAG AA for normal text; the given primary is a medium blue and may be short of 4.5:1):

| Token | Value |
| --- | --- |
| `--color-bg` | `#F3F6F8` |
| `--color-surface` | `#FFFFFF` |
| `--color-ink` | `#192332` |
| `--color-muted` | `#667385` |
| `--color-primary` | `#4E78E5` (darken if contrast fails) |
| `--color-border` | `#DDE5ED` |
| `--color-soft-blue` | `#EAF0FF` |

One sans-serif stack. Spacing on a 4/8px scale. Lucide icons only, used sparingly. No emoji icons, gradients, glass, donor map, leaderboard, or fake metrics.

### Public landing page

Derived from the product requirements, not from the dashboard screenshots.

Order: header (wordmark, Explore Campaigns, How It Works, NGO Login; a button-toggled nav on narrow screens) → hero with one real image, one headline, one supporting line, “Explore campaigns” and “For NGOs” → up to three active campaign cards → four category links (Education, Food & Essentials, Healthcare, Community Development) that open the directory filtered → a short list of published updates → three how-it-works steps → a short footer with the same navigation. No invented address, phone, or partner logos.

A campaign card shows image (fixed ratio), category, title, NGO name, short summary, status, and a progress line that matches the campaign mode. Money bars use received / goal. Item lines use received / needed. If there is no image, a local fallback still holds the layout.

### NGO dashboard (from the first two references)

Reuse as layout principles only:

- App canvas on a light grey page, white content surface, consistent outer padding.
- Compact top bar: product wordmark, one primary action (“New campaign”), sign-out. Skip the reference search-everything box, notifications, settings gear, and avatar menu.
- Narrow left sidebar, icon plus label, one active item with a clear bar. Entries for this app: Dashboard, Campaigns. Tooltip or visible label; do not copy the reference’s extra icons.
- Section title with a count, then a horizontal row of campaign cards. Card anatomy to reuse: fixed image crop, small status chip (days left or status), title, outlined action (“Manage”), a quiet footer with mode-appropriate figures (pledged vs received, not a single “raised” number).
- Below the cards, a calm metrics row: active campaigns, pending commitments, money received, items received. These replace the reference’s chart, world map, country list, and gradient stat tiles.
- Generous gaps, 8–12px radii, hairline borders, little or no shadow.

Explicitly out of scope: the reference brand, campaign names, donor names, currency figures, flags, “featured” marketing badges, donor rankings, worldwide map, bar chart of donations, average-donation tiles, and any control that does not work.

On small screens the sidebar collapses to a top nav or a menu button. The card row stacks.

### Pledge form (from the third reference)

Reuse the structure only: one heading, one white card, labels above fields, full-width controls, one obvious submit button, inline errors, a confirmation that does not claim money moved.

Do not reuse the pink page, pink labels, or pink button. Build it in the blue/white system.

Field mapping:

| Reference | SevaBridge |
| --- | --- |
| Category dropdown | Not a free category. The visitor picks one of this campaign’s item needs (name + unit + still needed). |
| Name | Donor name, required. |
| Item name as free text | Removed. The need is chosen from the campaign’s list so the pledge cannot name an item the campaign did not ask for. |
| Quantity | Positive whole number. |
| Location street address | Removed. Contact is email and/or phone (at least one), plus an optional message. A street address is extra personal data this workflow does not need. |
| Submit Donation | “Record pledge”. Helper text: this does not transfer money or items online; the NGO may contact you to arrange handover. |

Money mode swaps the item picker and quantity for an amount in INR. Campaigns with mode `both` show a two-option switch, then the matching fields. Closed, completed, draft, and archived campaigns do not show a working submit.

---

## 4. Architecture and key decisions

### Stack

React + Vite + TypeScript + React Router + Supabase (`@supabase/supabase-js`) + `lucide-react` + plain CSS. No second backend. No UI kit. No Tailwind. No Zod. No Supabase CLI required: SQL is a file in the repo, applied by pasting it into the Supabase SQL editor after review.

Router choice: `react-router-dom` with `BrowserRouter` and `<Routes>`. Not the React Router framework/Vite plugin, which would replace the normal Vite app layout.

### Frontend and routing

| Path | Who | Page |
| --- | --- | --- |
| `/` | Public | Landing |
| `/campaigns` | Public | Directory. Query params: `q`, `category`, `mode`, `status` (default `active`) |
| `/campaigns/:id` | Public | Detail + pledge |
| `/ngo/login` | Public | Sign-in |
| `/ngo/dashboard` | Owner | Metrics + campaign cards |
| `/ngo/campaigns` | Owner | All own campaigns |
| `/ngo/campaigns/new` | Owner | Shared campaign form |
| `/ngo/campaigns/:id` | Owner | Workspace: Overview, Commitments, Needs, Updates |
| `/ngo/campaigns/:id/edit` | Owner | Same form as create |

`RequireAuth` wraps `/ngo/*` except login. It sends anonymous visitors to `/ngo/login` and keeps the attempted path in router state so sign-in can return there. Sign-out clears the Supabase session and goes to `/`.

Hiding a button is not an access control. Every NGO query is also rejected by RLS when the user does not own the organization.

### Supabase client and env

One module, `src/lib/supabase.ts`, creates the browser client from:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

`.env.example` lists those names with empty values. Real values stay in `.env.local`, which is gitignored. The service-role key is never read by Vite.

### Data model

UUID primary keys. `created_at` on every table. `updated_at` on campaigns, item needs, and commitments.

**organizations** — `owner_user_id` unique, references `auth.users`. One owner per NGO. Public columns: `name`, `description`, `public_contact_email`, `logo_url`. `owner_user_id` is never granted to `anon` or `authenticated` for SELECT.

**campaigns** — belongs to one organization. `category` in `education | essentials | healthcare | community`. `campaign_mode` in `items | money | both`. `status` in `draft | active | completed | archived`. `money_goal` is `numeric(12,2)` and required by a check when mode is `money` or `both`; otherwise null. `summary` max 160 characters. `title` max 120.

**campaign_item_needs** — belongs to one campaign. `quantity_needed` is a positive integer. `unit` is required text (pieces, sets, boxes, kilograms). Shortcut: whole numbers only; switch to `numeric` if a real NGO needs fractional quantities.

**commitments** — belongs to one campaign. `commitment_type` is `item` or `money`. Status `pending | confirmed | fulfilled | cancelled`. Checks:

- email or phone is present
- money rows: positive `amount`, null item need, null quantity
- item rows: `item_need_id` set, positive integer `quantity`, null amount
- item need’s `campaign_id` matches the commitment’s `campaign_id`
- type is allowed by the campaign mode
- insert from the client cannot stick a non-pending status or a `fulfilled_at`

`fulfilled_at` is set by trigger when status becomes `fulfilled`, and cleared otherwise.

**campaign_updates** — belongs to one campaign. `created_by` is `auth.uid()`. MVP publishes immediately: insert sets `published_at = now()`. Draft updates are deferred.

Foreign keys: item needs and commitments use `ON DELETE RESTRICT` from item needs so a need with pledges cannot disappear. Campaign delete is not offered in the UI; archive is the exit. Deleting a campaign from the client is not granted.

### Who can read and write what

| Data | Anonymous | Signed-in owner |
| --- | --- | --- |
| Organization public columns | Select | Select own row, update own public fields if time permits; insert is not granted to the client |
| `owner_user_id` | No | No column grant; policies still use it internally |
| Campaigns `active`, `completed` | Select | Select/insert/update own |
| Campaigns `draft`, `archived` | No | Own only |
| Item needs of public campaigns | Select | Own campaigns, full manage |
| Published updates of public campaigns | Select | Own campaigns, insert |
| Commitment rows | No select, no update, no delete | Select and update status on own campaigns |
| New commitment | Insert only, forced to `pending`, active campaigns only | Not via the public form |

**Completed campaigns stay publicly readable** so a direct link can show a closed state. The directory defaults to `active`. Pledges are accepted only when status is `active`. This is a default; see [Unresolved decisions](#9-unresolved-decisions).

**Organization rows are not inserted from the app.** The demo org is created in the SQL editor. A stranger who signs up (if Auth sign-up is accidentally left on) gets a user with no organization and no rows. Disabling public sign-up is still required setup.

### Public aggregates

Anonymous clients must not `select` from `commitments` to draw progress. Two `security definer` SQL functions, `search_path = public`, return only numbers:

- `campaign_public_summaries(uuid[])` → per public campaign: `money_pledged`, `money_received`, `items_needed`, `items_pledged`, `items_received`. Campaigns that are not `active` or `completed` are omitted (a draft id looks like an empty result, same as an unknown id).
- `item_need_public_progress(uuid)` → per need on one public campaign: `quantity_pledged`, `quantity_received`.

Definitions match section 7 of the context file: pledged excludes `cancelled`; received is `fulfilled` only. The directory calls the summary function once with the ids it already loaded. The detail page calls both. Dashboard metrics are ordinary owner queries, not these functions.

**Review before apply:** these functions bypass row security. They must not select donor name, email, phone, message, or commitment ids. Grant `execute` to `anon` and `authenticated` only after that read-through.

### How a public pledge is inserted

Prefer a direct insert plus a `before insert` trigger over an Edge Function.

The trigger rejects the row unless all of the following hold: campaign exists and is `active`; type matches mode; contact, amount, quantity, and item-need rules pass; `status` is `pending`; `fulfilled_at` is null. RLS insert policy for `anon` repeats the same `with check`. There is no `select` policy for `anon`, so the client calls `insert` and does not chain `.select()`. The confirmation message is generic and does not echo contact details.

Anti-spam for v1 is a honeypot field (`company_website`) ignored by the database and dropped by the client when filled. Shortcut: this does not stop a script that talks to the API. Upgrade to an Edge Function with an IP rate limit if junk pledges show up. Do not spend the MVP window on that.

### How the NGO records fulfilment

The owner updates `status` on their own rows. Allowed values are only the four statuses. **Default state rules (review):** the owner may set any of the four, including correcting a mistaken “Received”, because a demo needs an undo. The trigger maintains `fulfilled_at`. A stricter one-way graph is safer against mis-clicks and is listed as an open choice.

Item-need edits: update rows by id; insert new rows; delete a need only when no commitment points at it. The foreign key is the backstop. The form shows the database error in plain language.

### RLS footgun to review before apply

Supabase often grants `anon` and `authenticated` broad rights on new `public` tables. The migration must `revoke` those defaults, then grant only:

- `anon`: select on public campaign/need/update columns and the public organization view; insert on `commitments`; execute on the two aggregate functions
- `authenticated`: the same public reads, plus select/insert/update on own campaigns, needs, and updates, and select/update on own commitments

No delete grant on campaigns or commitments. No insert grant on organizations.

Column grants, not just RLS, hide `owner_user_id`, donor contact columns from `anon`, and `donor_email` / `donor_phone` from any role that is not reading through the owner policy. PostgREST will not return a column the role cannot select. Policies may still reference `owner_user_id`.

**Do not apply the SQL until it has been read against this section.** A policy that is too open exposes donor contacts. Recovery is in Phase 2: revoke grants immediately, before any demo data that contains real contact details exists.

### Progress display

Indian numbering via `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`. The bar width is received/goal capped at 100%. The text can show an amount above the goal. Item bars use received/needed. Zero needed does not divide; show the raw counts and no bar.

---

## 5. Proposed file tree

```
SevaBridge/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  .env.example
  .gitignore
  README.md                          # replaced with setup + demo steps
  project_context_sevabridge.md      # unchanged
  IMPLEMENTATION_PLAN.md             # this file
  PHASE_0_CURSOR_PROMPT.md           # unchanged
  design/references/                 # unchanged; not imported by the app
  public/
    favicon.svg
    fallback-cover.svg               # local, so cards layout without a network image
  supabase/
    migration.sql                    # reviewed, then pasted into the SQL editor
    seed.sql                         # demo org + labelled sample campaigns; needs the auth user id
  src/
    main.tsx
    App.tsx                          # routes only
    vite-env.d.ts
    lib/supabase.ts
    lib/format.ts                    # INR + dates
    lib/validate.ts                  # form checks; database still enforces
    types.ts                         # hand-written row and form types
    styles/tokens.css
    styles/global.css                # reset, buttons, fields, cards, badges, progress
    components/
      Button.tsx
      Field.tsx
      Badge.tsx
      ProgressBar.tsx
      EmptyState.tsx
      Modal.tsx
      CampaignCard.tsx              # added in Phase 3, shared by public and NGO lists
    layouts/PublicLayout.tsx
    layouts/NgoLayout.tsx
    features/public/LandingPage.tsx
    features/public/CampaignDirectory.tsx
    features/public/CampaignDetail.tsx
    features/public/PledgeForm.tsx
    features/ngo/LoginPage.tsx
    features/ngo/RequireAuth.tsx
    features/ngo/DashboardPage.tsx
    features/ngo/CampaignListPage.tsx
    features/ngo/CampaignForm.tsx
    features/ngo/CampaignWorkspace.tsx
```

`global.css` holds shared component styles so there is not a CSS file per component. Split it only if it becomes hard to scan. No generated Supabase types and no test runner in v1; the checklist in section 8 is the test.

---

## 6. Phased plan

Each phase ends with the app still building. Time is a working estimate for one person with the agent, after this plan is approved.

### Phase 1 — Foundation (source written; install and check still open)

**Objective.** Runnable Vite app, routes that render titles, design tokens, shared controls, Supabase client wired but unused.

**Already in the tree. Do not rewrite.**

- Vite + React + TypeScript config, `package.json` with `react-router-dom`, `@supabase/supabase-js`, and `lucide-react`.
- Tokens, global styles, `Button`, `Field`, `Badge`, `ProgressBar`, `EmptyState`, `Modal`, both layouts, and placeholder pages for all eight routes.
- `src/lib/supabase.ts` (lazy client so missing env does not crash the shell), `src/types.ts`, `.env.example`, `.gitignore`, README.
- Primary blue set to `#3E63D4` after a contrast check. `RequireAuth` sends every protected URL to `/ngo/login`.

**Remaining after this revision is approved. Small pass, not a new app.**

- `npm install`, then `npm run build`.
- Open the public shell and confirm `/ngo/dashboard` redirects to login.
- Token-only adjustments from the audit: `--radius-card: 12px`, `--radius-control: 8px`, and Source Sans 3 as the first font in `--font-sans`. Apply those in `tokens.css` and `global.css`. Do not rebuild the pages.
- Leave placeholder copy. Do not invent campaigns so the landing page looks finished.

**Done when.** `npm run dev` shows the public shell and the login card. `npm run build` passes. Unauthenticated `/ngo/dashboard` redirects to login. No page pretends to have saved data. The NGO shell can be reviewed by reading `NgoLayout` and, if needed, a temporary look that is reverted so the redirect still holds.

**Failure.** If install or the build fails, fix that before Phase 2. Do not restyle the app to get a green build.

**Defer.** Real queries, SQL, seed data, deploy, a new campaign-card component.

### Phase 2 — Schema, RLS, aggregates (about 45 minutes)

**Objective.** Five tables, constraints, the two aggregate functions, and grants that match section 4, applied only after a human reads the SQL.

**Tasks.**

- Write `supabase/migration.sql` and `supabase/seed.sql`.
- Seed creates the organization only when given a real `auth.users` id, plus two or three campaigns labelled as demo data (fictional NGO name, no real impact claims).
- Document the apply order in the README: create Auth user → disable public sign-up → run migration → paste user id into seed → run seed.
- Verify in the SQL editor with the anon key (or the API docs “as anon”): a public campaign is readable; a draft is not; `commitments` select returns nothing; an insert with `status = fulfilled` fails; the summary function returns numbers and no donor fields; a second user cannot update the demo campaign.

**Files.** `supabase/migration.sql`, `supabase/seed.sql`, README section.

**Depends on.** Phase 1. Supabase project and demo user (user action).

**Done when.** The checks above pass in the Supabase dashboard before any React data layer is written.

**Failure.** If a policy looks wider than section 4, do not seed donor contacts. `revoke all` on the five tables from `anon` and `authenticated`, fix the SQL, re-grant narrowly. Do not “temporarily” disable RLS to debug and then forget.

**Defer.** Edge Function rate limit, storage buckets, email triggers, multi-owner.

### Phase 3 — Public read and pledge (about 70 minutes)

**Objective.** Landing, directory, detail, and a pledge that persists as `pending`.

**Tasks.**

- Load active campaigns, public org fields, needs, published updates, and aggregates.
- Add one `CampaignCard`: 16/10 photo (fallback SVG if the URL fails), category, title, NGO, one-line summary, and a received-progress line. Use it on the landing page, directory, and later the NGO list. No supporter avatars.
- Directory: search (title, summary, NGO name) and filters for category, mode, and status. Default status `active`. Category filters are text, not an icon row. No-results state clears filters.
- Detail: cover, story, pledged and received money, per-need received counts, updates newest first, not-found and closed states. Pledge panel is one card with a blue submit button and the offline-fulfilment sentence.
- Pledge form for items, money, or both. Client validation, then insert. Success copy says the pledge was recorded and fulfilment is offline.
- Landing leads with real cards when records exist, then category links, updates, and the three steps. Empty states when the database has no rows.

**Files.** `features/public/*`, `src/components/CampaignCard.tsx`, `lib/format.ts`, `lib/validate.ts`, small additions to `types.ts` if a query shape was missing.

**Depends on.** Phase 2 applied and verified.

**Done when.** Seeded campaigns show on `/` and `/campaigns`. A valid item pledge and a valid money pledge exist as `pending`. A pledge to a completed campaign is refused. Refresh keeps the rows. The public page never renders donor email or phone.

**Failure.** If aggregates are all zero while commitments exist, the function is running as the caller and RLS is hiding rows. Fix the function (`security definer`) before continuing. If insert returns a row, remove `.select()` and confirm `anon` still cannot read `commitments`.

**Defer.** Pagination, sort menus, image upload.

### Phase 4 — NGO sign-in and campaigns (about 60 minutes)

**Objective.** Owner can sign in, see only their campaigns, and create or edit one through the shared form.

**Tasks.**

- Email/password sign-in, readable auth errors, return to the intended path, sign-out.
- Dashboard: four metrics from this org’s rows, campaign cards, “New campaign”, empty state. No recent-activity panel in this phase.
- Campaign list: draft, active, completed, archived; status actions with a confirm modal (publish, unpublish to draft, complete, archive).
- Campaign form: create and edit, item-need rows, save draft or publish, disable the submit button while the request is in flight, surface the database error.

**Files.** `features/ngo/LoginPage.tsx`, `RequireAuth.tsx`, `DashboardPage.tsx`, `CampaignListPage.tsx`, `CampaignForm.tsx`, `layouts/NgoLayout.tsx`.

**Depends on.** Phase 2. Phase 3 is not strictly required to build the form, but the public pages must already exist so “publish” can be checked against them.

**Done when.** The demo owner signs in, publishes a new campaign, and sees it on `/campaigns` after refresh. A logged-out request to an NGO URL lands on login. Editing does not drop existing needs.

**Failure.** If login succeeds but every query is empty, `owner_user_id` does not match `auth.uid()` (seed user id was wrong). Fix the seed row; do not open RLS. If RLS blocks a legitimate owner update, adjust the owner policy only, and re-run the anon checks from Phase 2.

**Defer.** Profile editing, logo upload, staff invites.

### Phase 5 — Fulfilment and updates (about 40 minutes)

**Objective.** Close the loop: owner changes pledge status, public received numbers move, a published update appears on the campaign page.

**Tasks.**

- Workspace tabs: overview, commitments (name, type, item or amount, date, status, contact details), needs, updates, link to edit.
- Status actions write `pending | confirmed | fulfilled | cancelled` and show loading and error.
- Update form: title, body, optional image URL. After save, the public detail page shows it on refresh.
- Dashboard metrics use the same received/pending definitions as the public functions.

**Files.** `features/ngo/CampaignWorkspace.tsx`, any small query helpers added next to it.

**Depends on.** Phases 3 and 4.

**Done when.** Marking a money pledge received increases public “Received” and the goal bar, and does not change the “Pledged” total except by staying inside it. Cancelling removes it from pledged and received. An item pledge does the same for that need’s received count. A second browser with no session still cannot list commitments.

**Failure.** If the public number does not move, the UI is reading the wrong status or the summary function was not called again after navigation. Fix the query; do not store a hand-edited total column.

**Defer.** Emailing the donor, comment threads, draft updates.

### Phase 6 — Hardening (about 30 minutes)

**Objective.** The section 8 checklist passes on desktop and a narrow viewport. Deploy only if local checks pass.

**Tasks.**

- Walk the checklist. Fix the smallest break.
- Check the public pages against `DESIGN_REFERENCE_AUDIT.md`: photo cards, blue buttons, no fake metrics. Check the console still matches the FundUp shell, not the Bloomerang marketing page.
- Check mobile: public nav, stacked cards, pledge form, NGO nav, commitment actions.
- `npm run build` clean. No service-role string in the repo.
- Optional: Vercel (or similar) with the two `VITE_` env vars. Skip deploy if the checklist is red.

**Files.** Whatever the checklist forces. README deploy note only if a deploy happened.

**Depends on.** Phase 5.

**Done when.** Checklist items 1–15 in the product context pass, or a failed item is written down with the exact break.

**Failure.** A visual bug does not justify a rewrite. A privacy bug does: stop, revoke the grant or policy, then fix.

**Defer.** Anything in the cut list that is not already done.

---

## 7. Setup prerequisites

### Required before Phase 2

1. Supabase project.
2. Project URL and anon key in `.env.local` (never committed).
3. Authentication → disable public sign-ups. Turn off email confirmation, or confirm the demo user by hand, or password login will fail.
4. Create the demo user in Authentication → Users. Copy the UUID.
5. After review, run `supabase/migration.sql`, then `supabase/seed.sql` with that UUID.

### Already true

- Node.js and npm are installed (v24 / npm 11).

### Defaults, not questions

- Cover images are URLs. Empty URL uses `public/fallback-cover.svg`. No storage upload in v1.
- Sample campaigns ship in `seed.sql`, titled as demo data, owned by the demo organization.
- Env vars are only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 8. Risks and scope-cut order

| Risk | What goes wrong | Recovery |
| --- | --- | --- |
| RLS too open | Donor email/phone readable by anon | Revoke grants; fix SQL before seeding real contacts |
| RLS too tight | Owner sees an empty dashboard | Fix the owner policy; re-check anon |
| `security definer` function selects too much | Aggregate API leaks a message or contact | Drop the function; recreate with an explicit column list |
| Default Supabase grants | New table is world-readable | Migration starts with `revoke` |
| Public sign-up left on | Strangers get Auth users | They still get no org if insert is not granted; disable sign-up anyway |
| Honeypot only | Scripted pending inserts | Accept for the demo; Edge Function later |
| Time | 4 hours is tight for eight pages plus SQL | Cut in the order below |

Cut in this order when the clock slips. Do not cut items marked keep.

1. Vercel deploy
2. Dashboard “recent activity”
3. Extra seed campaigns beyond one item campaign and one money campaign
4. Campaign-list search (status actions still required)
5. Update image URL field
6. Hover and motion polish
7. **Keep:** RLS, pending-only public insert, received vs pledged, pledge form, publish, status change, public update, mobile usability of those flows

---

## 9. End-to-end test checklist

Walk this in Phase 6. Use the demo owner and a private/incognito window for the visitor.

**Core**

1. NGO signs in with email and password and lands on `/ngo/dashboard`.
2. NGO creates a campaign with mode, goal if money, and item rows if items, and publishes it.
3. Incognito: the campaign is on `/` or `/campaigns` and opens at `/campaigns/:id`.
4. Visitor submits a valid item pledge or money pledge.
5. Supabase row is `pending`, `fulfilled_at` null.
6. Incognito network responses contain no other commitment and no donor email or phone.
7. Owner sees the pledge, including contact, and sets Confirmed, then Received.
8. Public received total and progress bar change; pledged total still excludes cancelled and includes this received row.
9. Owner publishes an update; incognito refresh shows it.
10. A second Auth user, or no user, cannot update this campaign or read its commitments.
11. Refresh and a new visit still show the campaign, pledge totals, and update.
12. Empty required fields, zero quantity, zero amount, and a failed login show an error without claiming success. Double-clicking submit does not create two pledges (button disabled while in flight; if two still land, that is acceptable only if both are real pending pledges — note it).
13. `npm run dev` and `npm run build` succeed.
14. At about 375px width: nav opens, cards stack, pledge form submits, NGO can reach commitments.
15. Seed copy is visibly demo data.

**Negative**

- Insert with status `fulfilled` or a `fulfilled_at` value fails or is stored as `pending` only. Expected result of the planned trigger: the insert is **rejected**.
- Pledge against a draft, completed, or archived campaign fails.
- Item pledge whose need id belongs to another campaign fails.
- Money pledge with a quantity, or item pledge with an amount, fails.
- Cancelled pledge drops out of pledged and received totals.
- Direct URL of a missing id shows not-found, not a blank layout.
- `.env.local` and the service-role key are not in git.

---

## 10. Unresolved decisions

These have defaults. Say if you want the other option before Phase 2 SQL is applied.

1. **Completed campaigns are public to read, not to pledge.** Directory defaults to active. Alternative: hide completed campaigns entirely.
2. **The owner may set any commitment status, including undoing Received.** Alternative: one-way only (`pending → confirmed | cancelled | fulfilled`, `confirmed → fulfilled | cancelled`), with no UI undo.
3. **Quantities are positive integers.** Alternative: decimals, if a campaign needs fractional kilograms.
4. **Anti-spam is a honeypot, not an Edge Function.** Alternative: spend part of Phase 2 on a rate-limited function and slip a public page later.

No other product choices are open. Phase 1 should not start until you approve this plan.
