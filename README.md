# SevaBridge

NGO campaign and pledge tracker. Visitors discover needs and record item or money pledges. There is no payment gateway. The NGO confirms handover offline.

This is a student prototype. Planning notes live in `project_context_sevabridge.md` and `IMPLEMENTATION_PLAN.md`.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build
```

Public pages load campaigns when `.env.local` is set. The NGO login screen does not sign in yet. Protected NGO pages redirect to login.

## Environment

Copy `.env.example` to `.env.local` when you have a Supabase project:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not commit real keys. Do not put the service-role key in frontend env. `.env.local` is ignored by Git.

## Database setup

Do this once, in a Supabase project, after you have read `supabase/migration.sql`. The SQL editor runs with full access. The checks below then switch to the anonymous role.

1. Authentication → turn off public sign-ups. Turn off email confirmation, or confirm the demo user by hand.
2. Authentication → Users → add the demo NGO user. Copy that user’s UUID.
3. SQL editor → paste `supabase/migration.sql` → run it.
4. Copy `supabase/seed.example.sql` to `supabase/seed.sql`. Replace the placeholder UUID with that user id. Run `supabase/seed.sql` in the SQL editor. `seed.sql` is gitignored.
5. Project Settings → API. Copy the project URL and the anon key into `.env.local`. Leave the service-role key on the Supabase site.

Restart `npm run dev` after saving `.env.local`. The public pages then read active campaigns. Organisation queries must name their columns. `select *` on `organizations` fails because `owner_user_id` is not granted to the browser.

### Checks

Run these in the SQL editor after the seed. Each block rolls back. A failure means stop before anyone enters a real contact detail.

Campaigns an anonymous visitor can see. The draft clinic campaign must not be in the list:

```sql
begin;
set local role anon;
select title, status from public.campaigns order by title;
rollback;
```

Commitment rows are hidden. The first query should return no rows. The second should end with a permission error, because donor email is not granted:

```sql
begin;
set local role anon;
select id from public.commitments;
select donor_email from public.commitments;
rollback;
```

A pledge cannot be inserted as received. This should end with an error, not a saved row:

```sql
begin;
set local role anon;
insert into public.commitments (
  campaign_id, commitment_type, donor_name, donor_email, amount, status
)
select id, 'money', 'Test Donor', 'test@example.com', 100, 'fulfilled'
from public.campaigns
where title = 'Demo: rice purchase fund';
rollback;
```

A normal pledge counts as pledged, not received, and the result has no donor fields. Then the rollback removes it:

```sql
begin;
set local role anon;
insert into public.commitments (
  campaign_id, commitment_type, donor_name, donor_email, amount
)
select id, 'money', 'Test Donor', 'test@example.com', 100
from public.campaigns
where title = 'Demo: rice purchase fund';

select * from public.campaign_public_summaries(array(
  select id from public.campaigns where title = 'Demo: rice purchase fund'
));
rollback;
```

After that, as yourself (not as `anon`):

```sql
select count(*) from public.commitments;
```

The count should be 0. `money_pledged` in the summary should be 100 and `money_received` should be 0.
