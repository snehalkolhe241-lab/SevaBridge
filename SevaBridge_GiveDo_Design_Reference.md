# SevaBridge Design Reference: Give.do-Inspired Visual Direction

**Purpose:** Use Give.do as visual inspiration for SevaBridge's
public-facing experience while preserving SevaBridge's own identity,
scope, and offline-pledge model.

Reference: https://give.do/

## 1. Design goal

Make SevaBridge feel like a credible, human, campaign-led giving
platform---not a generic admin template or startup landing page.

The experience should help a visitor answer, quickly: 1. What causes
need support? 2. What exactly is being requested? 3. Which organization
is running the campaign? 4. Can I pledge money or physical items? 5.
What happens after I pledge?

Use authentic, emotionally respectful campaign imagery, strong content
hierarchy, generous spacing, clear calls to action, and trust
information close to decisions.

## 2. What to take inspiration from

Study these patterns on Give.do's public homepage: - Cause-led
navigation and ways to explore by issue. - Campaign cards that lead with
a human story and a strong image. - Clear campaign title, organization
attribution, progress/context, and a prominent next action. - A section
introducing trusted NGO partners. - A dedicated path for organizations
that want to raise support. - Impact/trust content and FAQs that help
visitors understand the platform. - A long-form homepage rhythm: hero →
causes/campaigns → trust → NGO invitation → FAQs/footer.

These are design patterns to reinterpret, not elements to copy verbatim.
Do not copy Give.do's logo, exact text, distinctive branding, or
payment-specific interactions.

## 3. SevaBridge product constraints

All design and copy must respect these rules: - Public visitors can
browse active campaigns without signing in. - Public visitors do not
need accounts to submit pledges. - NGO accounts use Supabase Auth. -
Campaigns can request money, physical items, or both. - A pledge is an
expression of intent, not proof that money or goods have been
received. - All fulfilment and handover happen offline. - No payment
gateway or online checkout. - Keep donor contact information and private
commitments out of public views. - Draft campaigns must never appear in
public campaign listings or public campaign detail routes. - NGOs can
manage only their own organization's records. - Use only real data from
Supabase where the page is connected. For prototype seed data, label it
clearly as demo/sample content and do not imply real impact.

## 4. Visual direction

### Overall feeling

Warm, credible, editorial, human, and easy to navigate. Use photography
and story content to provide emotional context; keep the interface
itself restrained and legible.

### Suggested color tokens

Use these as a starting point, not as a requirement to rewrite the
existing design system immediately: - Primary blue: `#3F72C9` - Deep
blue: `#244A85` - Soft blue surface: `#EAF2FF` - Page canvas:
`#F5F8FC` - White surface: `#FFFFFF` - Main text: `#1D2939` - Secondary
text: `#64748B` - Border: `#DCE5F0`

Reserve primary blue for important actions and selected states. Avoid
making every card, icon, and section blue. Use white space, image
composition, typography, and subtle dividers to create hierarchy.

### Typography

-   Use a highly readable sans-serif family for body copy and UI.
-   Use strong, clear headings with a distinct scale: hero heading,
    section heading, card title, body, metadata.
-   Keep paragraph widths comfortable and line-height generous.
-   Avoid excessive uppercase labels, tiny metadata, and oversized text
    everywhere.
-   Prioritize accessibility and legibility over decorative typography.

### Photography and imagery

-   Use wide, high-quality campaign images with consistent aspect
    ratios.
-   Images should support the campaign story and be respectful,
    consent-aware, and contextually relevant.
-   Avoid generic stock photos where possible, overly staged images,
    misleading imagery, and images that exploit beneficiaries.
-   Add a tasteful fallback for missing images.
-   Use image overlays only when needed for readable text; do not place
    long text over busy photography.

### Layout and spacing

-   Use a centered content container with consistent horizontal padding.
-   Give sections clear vertical separation.
-   Prefer a deliberate grid and consistent card dimensions.
-   Use rounded corners sparingly and consistently; avoid making every
    element a floating pill or giant rounded card.
-   Use subtle borders and shadows only when they clarify hierarchy.
-   Make the page responsive: desktop grid, tablet grid, and stacked
    mobile layout.

## 5. Public homepage (`/`)

Recommended section order:

### A. Header

-   SevaBridge wordmark on the left.
-   Main links: Explore Campaigns, How It Works, For NGOs.
-   Primary action: Explore Campaigns.
-   NGO login as a secondary link/button.
-   Keep the header clean and uncluttered; make mobile navigation
    usable.

### B. Hero

Use a strong two-column composition on desktop: - Left: concise headline
about connecting people with community needs, a short explanation of
money and item pledges, and a primary "Explore campaigns" CTA. -
Secondary CTA: "For NGOs" or "How it works". - Right: a large,
respectful campaign image or a compact editorial collage of campaign
imagery. - Do not use fake counters, invented impact metrics, fabricated
testimonials, or unverified trust claims.

Suggested copy direction (rewrite to fit the product): - Headline:
"Small acts of support. Real needs, met together." - Supporting copy:
"Discover community campaigns and pledge money or essential items. NGOs
coordinate collection and handover offline." - CTA: "Explore
campaigns" - Secondary link: "How SevaBridge works"

### C. Explore by cause

-   Use a row or grid of clear cause categories such as Education,
    Essentials, Healthcare, Animal Welfare, and Community Support, only
    where supported by the current data model.
-   Categories should be clickable filters or links, not decorative
    tiles.
-   Keep icons optional and restrained; labels must remain clear without
    icons.

### D. Featured campaigns

-   Show a curated row/grid of active campaigns from Supabase.
-   Each card should include:
    -   Campaign image or consistent fallback.
    -   Cause/category label.
    -   Campaign title.
    -   Short, readable summary.
    -   Organization name.
    -   Support type badge: "Items", "Money", or "Items + Money".
    -   A clear "View campaign" action.
-   For money campaigns, show a goal only if it exists and make clear
    that pledges are not payments received.
-   For item campaigns, show requested item names and quantities only
    when those values are available and safe to display.
-   Do not show private donor information.
-   Do not imply pledged amounts/items have already been received.

### E. How SevaBridge works

Use three simple steps with concise descriptions: 1. Discover a
campaign. 2. Pledge money or items. 3. Coordinate offline handover with
the NGO.

Explain clearly that SevaBridge does not process payments or collect
goods online.

### F. NGO invitation

A distinct, editorial section for NGOs: - Explain that organizations can
publish campaigns and manage pledges. - CTA: "NGO sign in" or "Manage
campaigns". - Do not promise public self-registration if public NGO
sign-up is disabled. Do not show a public "Create account" flow unless
it exists and is intentionally supported.

### G. Trust and transparency

-   Explain how campaign information is presented and how offline
    handover works.
-   Only display verified status, metrics, partnerships, or claims if
    the product actually supports and substantiates them.
-   Prefer transparent process explanations over invented trust badges.

### H. FAQ and footer

Include practical questions: - Do I need an account to make a pledge? -
Does SevaBridge process online payments? - How are physical items handed
over? - Does a pledge mean the donation has been received? - How can an
NGO manage its campaigns? Keep answers consistent with the actual
product.

## 6. Campaign directory (`/campaigns`)

Aim for a discovery experience rather than a generic table. - Page
heading and short explanatory line. - Search input if implemented. -
Category filter if implemented. - Support-type filter: Items, Money,
Items + Money if implemented. - Sort only by options that actually
work. - Responsive campaign-card grid matching the homepage. - Friendly
empty state when no active campaigns match. - Only list campaigns with
`active` status. - Loading and error states should be designed, not left
as raw errors.

Do not add non-functional filters or controls just for appearance.

## 7. Campaign detail (`/campaigns/:id`)

Treat the campaign as a story page.

### Layout

-   Breadcrumb/back link to campaign discovery.
-   Large campaign image.
-   Category and support-type labels.
-   Clear title and organization attribution.
-   A readable story/description with sensible line length.
-   A distinct support panel on desktop, placed beside the story or in a
    clear section below on mobile.

### Support panel

For an item campaign: - List requested items, quantities, and units. -
Let the visitor choose an item/quantity only if the current data model
and form support it. - Collect only the contact details genuinely
required for offline coordination. - State that the pledge is not yet
received and handover is coordinated offline.

For a money campaign: - Provide a monetary pledge amount input if
supported. - Clearly state that this records an intended pledge only;
SevaBridge does not transfer or collect the money. - Do not display a
fake checkout, card-payment form, or "payment successful" message.

For campaigns supporting both: - Make the choice between money and items
explicit and simple.

### Status and trust

-   Never expose draft campaigns to public visitors.
-   Never show donor contact details or private commitment records
    publicly.
-   Do not display "received" totals unless they are based on actual
    received/fulfilled records and the UI clearly labels them.
-   Distinguish "pledged" from "received/fulfilled".

## 8. NGO experience

Give.do's public site is inspiration for public storytelling; the NGO
management experience should be purpose-built for SevaBridge.

### NGO login

-   Minimal, professional sign-in form.
-   Clear validation and error feedback.
-   No public sign-up option while signups are disabled.
-   Explain who should use the NGO portal.

### NGO dashboard

-   Clean, information-dense but not cluttered.
-   Summary metrics should reflect actual data: active campaigns,
    pending commitments, fulfilled commitments, and drafts.
-   Use restrained charts only if they add decision value and use real
    data.
-   Prominent "Create campaign" action.
-   Clear campaign table/list with status, support type, and last
    updated date where available.
-   Helpful empty state for new NGOs.

### Campaign management

-   Separate overview, commitments, and updates into clear sections or
    tabs if already in the plan.
-   Use readable status labels and explicit actions.
-   Keep pending, confirmed, fulfilled, and cancelled commitments
    distinct.
-   Do not mark a commitment as received/fulfilled without an explicit
    NGO action.
-   Ensure all management data is scoped to the authenticated NGO's
    organization.

## 9. Components to build or refine

Use shared reusable components instead of styling every page
independently: - `SiteHeader` - `SiteFooter` - `CampaignCard` -
`CampaignGrid` - `CauseFilter` or category navigation -
`SupportTypeBadge` - `OrganizationAttribution` - `CampaignImage` with
fallback - `EmptyState` - `LoadingState` - `ErrorState` - `PledgeForm` -
`StatusBadge` - `NgoPageHeader`

Follow the existing project structure and naming conventions where they
already exist. Do not create duplicates if equivalent components are
already present.

## 10. Interaction and accessibility

-   All buttons and links must perform their stated actions.
-   Ensure visible keyboard focus, adequate contrast, meaningful alt
    text, and properly associated form labels.
-   Use accessible error and success messages.
-   Avoid animation that distracts from the campaign content.
-   If adding hover effects, keep them subtle and ensure touch/mobile
    interactions still work.
-   Provide loading, success, empty, and failure states for asynchronous
    data operations.
-   Confirm responsive behavior at common mobile, tablet, and desktop
    widths.

## 11. Implementation instructions for Cursor

1.  Read `CONTEXT.md`, `IMPLEMENTATION_PLAN.md`,
    `DESIGN_REFERENCE_AUDIT.md` if present, and inspect the current code
    before editing.
2.  Audit the current design and list the existing routes/components
    that need changes.
3.  Preserve the current working project, database schema, routes,
    authentication model, and security boundaries.
4.  Implement the design in small phases:
    -   First: shared visual tokens, header, typography, spacing, and
        campaign card.
    -   Second: homepage.
    -   Third: campaign directory and detail page.
    -   Fourth: NGO login/dashboard and campaign management polish.
5.  Use real Supabase data where integration exists. Clearly label
    seeded sample campaigns as demo content.
6.  Do not invent images, metrics, testimonials, verification badges,
    campaign progress, or NGO credentials.
7.  Do not add payments, donor accounts, chat, maps, or unrelated
    features.
8.  Do not weaken RLS, expose private data, or use the service-role key
    in the browser.
9.  After each phase, run the build and relevant checks; fix regressions
    before continuing.
10. Report files changed, visible improvements, what was tested, and
    anything still incomplete. Explain technical decisions in
    beginner-friendly language.

## 12. Definition of done

The result should: - Feel like a polished, human-centered nonprofit
campaign platform. - Use strong, consistent campaign imagery and clear
story hierarchy. - Make campaign discovery and the next action
obvious. - Make money-versus-item pledging understandable. - Clearly
communicate offline fulfilment. - Work responsively. - Keep draft
campaigns and private donor data protected. - Reuse existing project
architecture rather than rebuilding from scratch. - Maintain
SevaBridge's identity instead of copying Give.do.

## 13. Reference

-   Give.do homepage: https://give.do/
-   Give.do about page: https://give.do/aboutus

**Design principle:** Borrow the clarity, campaign storytelling,
imagery, and trust-building rhythm. Build the actual workflows and
language around SevaBridge's distinct offline pledge model.
