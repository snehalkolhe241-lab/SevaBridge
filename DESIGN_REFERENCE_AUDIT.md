# SevaBridge — Design reference audit

**Date:** 18 October 2026  
**Purpose:** Record what was actually seen, and the visual decisions for SevaBridge. This does not change product scope.

SevaBridge stays blue and white. The references are for structure and tone. Their brands, colours, campaign names, amounts, photography, and extra products are not ours.

---

## 1. What was inspected

| Source | What loaded | What this is for |
| --- | --- | --- |
| https://give.do/ | Homepage | Public landing |
| https://give.do/fundraisers | Fundraiser directory | Campaign discovery |
| https://www.ketto.org/ | Homepage | Entry to fundraising |
| https://www.ketto.org/crowdfunding/fundraisers | Fundraiser list and cards | Campaign cards and filters |
| https://bloomerang.co/product/donor-database/ | Redirected to https://bloomerang.com/crm | Marketing page for a donor database |
| https://bloomerang.com/product-tours/donor-database | Lead form, not the product | Gated tour |
| `design/references/fundup-campaign-cards-reference.png` | Local image, already reviewed | NGO card hierarchy |
| `design/references/fundup-full-dashboard-reference.png` | Local image, already reviewed | NGO console density |
| `design/references/donation-form-functional-reference.png` | Local image, already reviewed | Pledge form structure only |

Viewport note: pages were measured at 1440px wide. Screenshots of those pages were cropped, so layout notes below also use the DOM (heading order, computed fonts, card markup), not the crop alone.

---

## 2. Give.do — public discovery

**Seen**

- White page, Poppins, near-black text (`#222`), coral actions (`rgb(231, 66, 75)`), button radius 8px, padding about 12px 22px.
- Homepage opens with large photographs, not a text hero. A mission card is a photo with a small label on the image (“Mission”), a short white title on the photo, then one sentence and a coloured text link under the card.
- Next, a large headline (“Donate to verified NGOs…”) sits beside that photography. Later sections are fundraiser rows, partner logos, press, quotes, and a blog.
- Directory: a pale banner, a search field (“Search NGOs or Fundraiser”), “More Filters”, then an icon row of causes. Below that, campaign cards: photo, title, “by [organisation]”, and a small benefit chip.
- Mobile (first load, before the width override): logo left, menu icon right, cards stacked full width.

**Use**

- The public home should lead with real campaign photographs and a short headline, not a feature grid.
- A campaign card is: fixed-ratio photo, category, title, one sentence, organisation name, and one action.
- Discovery needs a search box and a few category controls. Four SevaBridge categories are enough as text links. An icon carousel is not.

**Do not use**

- Coral brand, monthly-pledge product, tax-benefit chips, partner logos, press, blog, chat button, or any impact statistic.
- Their campaign titles, amounts, or photographs.

---

## 3. Ketto — campaign cards and giving

**Seen**

- White page, DM Sans, grey text (`rgb(68, 68, 68)`). Homepage is a photo collage, a teal primary action, and a dark “Contribute Now” button (radius 8px). It also shows large vanity figures. Those figures are out of scope.
- Directory: left category list, search, category / sort / location filters, then a grid of cards.
- Card markup and a screenshot of the list: landscape photo (about 242×146, top corners 16px), title truncated to two lines, a hairline, then two facts side by side (amount and days left), a thin progress bar (one measured bar was about 20% wide), a supporter line, and one teal Contribute button (`rgb(1, 191, 189)`, radius 4px).
- Clicking a card image and a Contribute control did not open a story page or a donation form. The cards are not links in the accessibility tree.

**Not seen**

- A campaign story page.
- A donation or pledge form on Ketto.
- Checkout, amounts, or success states.

**Use**

- Directory cards stay compact: photo, title, NGO, deadline if set, and a progress line. Two numbers max, and they must be labelled Pledged and Received. The bar uses received / goal for money, received / needed for items.
- One primary action on the card: open the campaign. The pledge itself lives on the detail page.
- Detail page, from the product requirements plus this card grammar: large cover, title and NGO, story, progress, item list, updates, and a single pledge panel. The panel must say the pledge is not a payment.

**Do not use**

- Teal brand, supporter avatars, “people contributed” social proof, share buttons, monthly giving, or medical-emergency framing.
- Any Ketto campaign name, amount, or photograph.

---

## 4. Bloomerang — NGO operations

**Seen**

- `bloomerang.co/product/donor-database/` redirected to `bloomerang.com/crm`.
- That page is a marketing site: white background, a display grotesque (“PP Right Grotesk”), an 80px headline, black pill buttons (radius 45px), a grey secondary pill, star ratings, and a black feature band with icons.
- Copy describes dashboards, timelines, and donor groups. No live application chrome was on the page.
- `bloomerang.com/product-tours/donor-database` is a form (email, name, phone, organisation, title) in front of “Start Your Tour”. The tour was not started. No personal data was entered.

**Not seen**

- An authenticated Bloomerang dashboard, donor record, table, or navigation shell.

**Use**

- The idea of one operational view: the NGO sees their campaigns, what is still pending, and what was received. That matches the existing console plan.
- The local FundUp screenshots remain the layout reference for that console, because they actually show a sidebar, top bar, and campaign cards. Bloomerang’s public site does not.

**Do not use**

- Black marketing bands, 80px headlines, pill buttons, ratings, lead forms, AI email, or a donor CRM.
- Do not restyle the NGO console to look like the Bloomerang homepage.

---

## 5. Local screenshots (unchanged conclusions)

- FundUp cards: fixed photo, status chip, title, outlined action, quiet figures underneath. Reuse the hierarchy. Do not reuse the brand, names, map, or leaderboard.
- FundUp full dashboard: slim icon sidebar, compact header, one primary button, card row, then lower panels. Our lower panels are four real metrics, not a chart or a map.
- Donation form image: one card, label above each field, one submit button. Restyle in blue and white. Item pledges pick a campaign need. Contact is email or phone, not a street address.

---

## 6. SevaBridge visual direction

### Public site

Editorial and photographic. White surface, ink text, one blue for links and the main button.

1. Header: wordmark, Explore Campaigns, How It Works, NGO Login. Menu button below 768px.
2. Opening block: one sentence of what SevaBridge does, then the campaigns. If a cover image exists, it is the hero. If none exists yet, say so. Do not invent a statistic to fill the space.
3. Up to three campaign cards.
4. Four category text links.
5. Latest updates, three steps, short footer.

### Directory

Title, one search field, filters for category, support type, and status. Card grid. Empty and no-results states. No icon carousel and no sort control that does not sort.

### Campaign detail

Cover, title, category, NGO, status, deadline, story. Money shows Pledged and Received separately; the bar is received / goal. Items show needed and received per row. Updates, newest first. Pledge card with item or money fields and the offline-fulfilment sentence.

### NGO console

Keep the shell already in `NgoLayout`: light grey page, white sidebar, Dashboard and Campaigns, top bar with New campaign. Main area is a heading, four counts, then campaign rows or cards using the same card anatomy as the public site, denser. Login stays a single centred card.

### Tokens

Keep the current palette. `#3E63D4` replaces `#4E78E5` because white-on-blue and blue-on-white need at least 4.5:1.

| Token | Value | Role |
| --- | --- | --- |
| `--color-bg` | `#F3F6F8` | Page |
| `--color-surface` | `#FFFFFF` | Cards, header |
| `--color-ink` | `#192332` | Text |
| `--color-muted` | `#5C6B7A` | Secondary text. Darkened so it clears 4.5:1 on the page background |
| `--color-primary` | `#3E63D4` | Links, main button |
| `--color-primary-hover` | `#3457C8` | Hover |
| `--color-border` | `#DDE5ED` | Hairline |
| `--color-soft-blue` | `#EAF0FF` | Active nav, soft fill |
| `--radius-control` | `8px` | Buttons, fields |
| `--radius-card` | `12px` | Cards and photos. Not pill-shaped |
| `--font-sans` | Source Sans 3, then Segoe UI, system-ui | One family. Add the webfont when the shell is verified |

Buttons: 40px tall, 8px radius, blue fill or blue outline. No 45px pills.

### Components to keep

`Button`, `Field`, `Badge`, `ProgressBar`, `EmptyState`, `Modal`, both layouts. Add a `CampaignCard` when public data exists, shared by the landing page, directory, and NGO list. Do not add it before there is data to put in it.

### Responsive

- Under 768px: public nav collapses; cards are one column; pledge form is a single column.
- NGO sidebar becomes a horizontal nav until 960px, which is already how `NgoLayout` is written.
- Photos keep one ratio inside a group (16 / 10 on public cards).

---

## 7. Research limits

- Ketto campaign story and donate flow were not opened.
- Bloomerang’s real donor database was not opened. The tour requires a lead form.
- Give.do and Ketto screenshots in this session were cropped relative to the 1440px layout width.
- No SevaBridge screen was opened in a browser. Dependencies are not installed yet (`node_modules` is absent), so the current UI has not been visually verified.
