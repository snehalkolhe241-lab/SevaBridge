# SevaBridge — work so far

Handoff for a new chat. Product rules stay in `project_context_sevabridge.md`. This file is only the current state.

**Do not commit or push unless the user asks.** If a file has a secret, say so. `.env`, `.env.local`, and the Supabase service-role key must never be committed. `supabase/seed.sql` is gitignored because it holds the real Auth user id. Commit `supabase/seed.example.sql` only; that copy stays on the placeholder id.

## Product

SevaBridge is a student prototype. An NGO publishes a campaign. A visitor pledges items or money without an account. Nothing is paid online. The NGO later marks what was actually received, and the public page shows that. A pledge is not a received donation.

Out of scope: payments, donor accounts, NGO self-signup, chat, maps, leaderboards, file upload.

## Done

### Phase 0

- `IMPLEMENTATION_PLAN.md` is the build plan.
- `DESIGN_REFERENCE_AUDIT.md` records Give.do, Ketto, and Bloomerang. Public pages should be photographic and plain. Campaign cards show a photo, the NGO, and separate pledged and received figures. The NGO console keeps a light sidebar shell. Bloomerang’s live app was not seen. Ketto’s story page and donate form did not open.

### Phase 1 — app shell, verified

React, Vite, TypeScript, React Router. Dev server: `npm run dev` → `http://localhost:5173/`. `npm run build` passed.

- Routes exist for `/`, `/campaigns`, `/campaigns/:id`, `/ngo/login`, and the NGO pages.
- Public header, landing, directory, and detail are placeholders. They do not load campaigns.
- `/ngo/dashboard` redirects to `/ngo/login`. Sign-in is not connected to Supabase yet.
- Shared pieces: `Button`, `Field`, `Badge`, `ProgressBar`, `EmptyState`, `Modal`, both layouts.
- Tokens: blue `#3E63D4`, card radius 12px, control radius 8px, font Source Sans 3.
- `src/lib/supabase.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` and does not crash if they are missing.
- `.env.example` has empty names only.

Checked in the browser: home page, Education empty state, login redirect, phone menu. The NGO console layout is in code and was not shown, because the redirect is intentional.

### Phase 2 — SQL written, not run

- `supabase/migration.sql`: five tables, pledge checks, row security, two total-only functions.
- `supabase/seed.sql`: fictional “SevaBridge Demo Collective”, two public sample campaigns, one hidden draft. It refuses to run while the user id is `00000000-0000-0000-0000-000000000000`.
- README section **Database setup** has the apply steps and four checks.
- No Supabase project is connected. The anon checks have not been run.

Visitors may insert a pledge only as pending. They cannot list pledges or read donor email and phone. Progress functions return numbers only.

## Not done

- Supabase project, demo login, and applying the SQL.
- Phase 3: public pages reading real campaigns, and the pledge form.
- Phase 4: NGO sign-in, dashboard counts, create and edit campaign.
- Phase 5: mark a pledge received, publish an update, public totals change.
- Phase 6: full checklist and deploy.
- `CampaignCard`, `PledgeForm`, `format.ts`, and `validate.ts` are not created yet.

## Git

Remote: `https://github.com/snehalkolhe241-lab/SevaBridge.git` on `main`.

Pushed commits include the plan and the Phase 1 shell. As of this note, `supabase/` is still untracked and the README database section may be uncommitted. Do not commit a seed file that contains a real user id.

## Next step

The user sets up Supabase. Phase 3 waits until the README checks pass.

1. Create a project at https://supabase.com/dashboard.
2. Authentication: turn off public sign-ups. Turn off email confirmation, or confirm the user by hand.
3. Authentication → Users → Add user. Use any demo email and password. Copy the user UUID.
4. SQL Editor → New query → paste all of `supabase/migration.sql` → Run.
5. Copy `supabase/seed.example.sql` to `supabase/seed.sql`. Replace only `00000000-0000-0000-0000-000000000000` with that UUID. Paste `supabase/seed.sql` into the SQL editor and run it. That file is gitignored.
6. Run the four check blocks in the README. Expected: two public campaigns and no draft; pledge list empty or denied; inserting a received pledge fails; a normal test pledge shows `money_pledged` 100 and `money_received` 0, then disappears after rollback. A final `select count(*) from public.commitments` is 0.
7. Project Settings → API. Copy the project URL and the anon (or publishable) key into `.env.local`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Do not copy the service-role or secret key. `.env.local` is already gitignored.

8. Tell the assistant the checks passed. Then Phase 3 can start.
