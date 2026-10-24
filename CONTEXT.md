# SevaBridge — work so far

Handoff for a new chat. Product rules stay in `project_context_sevabridge.md`. The build steps stay in `IMPLEMENTATION_PLAN.md`. This file is the progress tracker. Update it at the end of every phase.

**Do not commit or push unless the user asks.** If a file has a secret, say so. `.env`, `.env.local`, and the Supabase service-role key must never be committed. `supabase/seed.sql` is gitignored because it holds the real Auth user id. Commit `supabase/seed.example.sql` only; that copy stays on the placeholder id.

## Product

SevaBridge is a student prototype. An NGO publishes a campaign. A visitor pledges items or money without an account. Nothing is paid online. The NGO later marks what was actually received, and the public page shows that. A pledge is not a received donation.

Out of scope: payments, donor accounts, NGO self-signup, chat, maps, leaderboards, file upload.

## Progress tracker

The plan has Phase 0 plus Phases 1–6. There is no Phase 7. A phase is **checked** only when its “done when” checks were actually run. **Built** means the code is in the app and `npm run build` passed, but a required check was not run.

| Phase | State | What is actually done | Not checked |
| --- | --- | --- | --- |
| 0 Plan | Checked | `IMPLEMENTATION_PLAN.md` and `DESIGN_REFERENCE_AUDIT.md` are written. | — |
| 1 Shell | Checked | Vite app, routes, tokens, shared controls, login redirect. Build passed. Home, empty Education filter, login redirect, and the phone menu were opened. | The NGO sidebar was not shown on purpose, because logged-out visits redirect. |
| 2 Database | Checked, one gap | User created the Supabase project, turned off public sign-up, ran `migration.sql` and `seed.sql`. Anonymous checks passed: two active campaigns visible, draft hidden, donor email denied, a fulfilled insert denied, a normal pledge saved only when the new row is not returned. | A second login was not used to prove it cannot edit the demo campaign. |
| 3 Public site | Checked, one gap | Home and `/campaigns` show the active campaigns. Search, filters, and clear filters work. An item pledge and a money pledge stayed after refresh. The public page does not show the donor email. | There is no completed campaign, so a pledge against a completed campaign was not tried. |
| 4 NGO campaigns | Checked | The demo owner signed in. The dashboard showed SevaBridge Demo Collective only: 2 active campaigns, the private clinic draft, 2 pending pledges, ₹50 received, 0 items received. A new items campaign, “Demo: water bottles for a workshop”, was published and appeared on `/`, `/campaigns`, and its public page. Editing it, saving a note, and reloading kept one item row (Water bottles, 12 pieces). Sign-out landed on `/`. A later logged-out visit to `/ngo/dashboard` returned to login. | — |
| 5 Fulfilment | Checked for items | On the notebooks campaign the owner saw the pledge contact. Confirmed, then Received. The public page stayed at Pledged 2 and moved to Received 2, and the donor email was not on that page. Cancelling that received pledge dropped both totals to 0. Setting it back to Received restored Pledged 2 and Received 2. An extra anonymous pencil pledge raised pledged to 3; cancelling it brought pledged back to 2 and left received at 2. The owner posted “Demo update: first notebooks received”, and the public page and the home page showed it after refresh. An anonymous read of donor email is still denied, and a read of commitment ids returns no rows. | The rice money pledge was not clicked this session. Its public page still shows the earlier ₹50 received inside ₹150 pledged. |
| 6 Hardening | Walked, two gaps left | Checklist items 1–9 and 11–15 were run on this pass or an earlier one. Searching “clinic” still hides the draft. At 375px the NGO nav and the commitment buttons fit the width with no horizontal overflow, and scrolling reached the lower pledge actions. Before sign-out the dashboard showed 3 active campaigns, 1 pending pledge, ₹50 money received, and 2 items received. Sign-out landed on `/`. A later logged-out visit to `/ngo/dashboard` returned to login. `npm run build` had already passed. No service-role key is in the source. Deploy was skipped. | A second Auth user was not used (item 10). A pledge on a completed campaign was not tried, because no campaign was completed. |
| Visual pass | Checked | Public homepage now has a 4-slide hero, a slim marquee, cause-matched photos, and cleaned public copy. Section links scroll on `/` and from other routes. Duplicate header Explore button removed. `npm run build` passed. Homepage checked at a wide layout and at 390px. Campaign, FAQ, login, and directory links were opened. | Did not sign in. A live pledge was not submitted on this pass. |

Phases 0, 1, and 4 are fully checked. Phases 2 and 3 each have one check skipped. Phase 5’s item path is checked; the money status click was not repeated. Phase 6 is not fully green for the reason in the table. Nothing was deployed.

## Demo data left in Supabase

These are sample rows. Pledged is not received.

Public pages, the NGO dashboard, the campaign list, and the campaign workspace show these names now. The edit form still shows the stored titles, so saving it does not rewrite the database. The rows in Supabase still use the old titles until `supabase/refresh-demo-copy.sql` is run in the SQL editor. That script does not change quantities, money goals, or pledge totals, and it does not publish the draft. Do not re-run `seed.sql`. No database change was made on this pass.

- Rice fund, shown as “A week of meals for a community kitchen”: ₹25,000 goal, ₹150 pledged and ₹50 received. The ₹100 pledge is still pending.
- After-school notebooks, shown as “Notebooks for an after-school class in Nagpur”: 40 notebooks and 100 pencils. 2 notebooks pledged and 2 received. One cancelled pencil pledge, “Phase6 cancel check”, stays in the owner list and is excluded from both totals.
- Water bottles, shown as “Water bottles for a Saturday class in Pune”: 12 pieces, no pledges. The draft health-camp campaign stays private and is shown as “Essential supplies for a rural health camp”.
- Evening centre, shown as “Learning supplies for an evening centre in Pune”: 80 notebooks and 150 pencils, pledged 0 and received 0.
- Weekly kitchen, shown as “Rice and dal for the Hadapsar weekly kitchen”: ₹18,000 goal, pledged 0 and received 0.
- Reading room, shown as “Restoring a neighbourhood reading room in Pune”: 8 tarpaulin sheets and a ₹15,000 goal, pledged 0 and received 0.
- The organisation is shown as Setu Community Collective. It is fictional. Signed-in dashboard on this pass: 6 active campaigns, 1 pending pledge, ₹150 money pledged, ₹50 money received, 2 items pledged, 2 items received. Pledge counts were 1 pending, 0 confirmed, 2 received, 1 cancelled.

## Git

Remote: `https://github.com/snehalkolhe241-lab/SevaBridge.git` on `main`.

Do not commit `.env.local` or `supabase/seed.sql`.

## Next step

The plan stops at Phase 6. Run `supabase/presentation-data.sql` once in the Supabase SQL editor. It was not applied from the app. It keeps the current pledges, adds sample pledges and two campaigns, and renames the organisation. Do not run `supabase/seed.sql`. Two product checks are still open. The water-bottles campaign stays active.

1. Second login. Public sign-up is off, so add a second user in Supabase → Authentication → Users. Sign in as that person. They must not see the demo campaigns, edit one, or read a donor email. Then sign out.
2. Closed campaign. Sign in as the demo owner. On Campaigns, use Complete on the 12-bottle campaign only. Until the SQL above is run, that row is still titled “Demo: water bottles for a workshop”. Sign out, open that campaign, and try to pledge. The page may stay visible. The pledge must be refused. Leave the rice and notebook campaigns active.

Deploy stays off until those two are done or you decide to skip them.
