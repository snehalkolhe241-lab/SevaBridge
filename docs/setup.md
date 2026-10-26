# Database setup

Do this once, in a Supabase project, after you have read `supabase/migration.sql`. The SQL editor runs with full access. The checks below then switch to the anonymous role.

1. Authentication → turn off public sign-ups. Turn off email confirmation, or confirm the demo user by hand.
2. Authentication → Users → add the demo organisation user. Copy that user’s id.
3. SQL editor → paste `supabase/migration.sql` → run it.
4. Copy `supabase/seed.example.sql` to `supabase/seed.sql`. Replace the placeholder id with that user id. Run `supabase/seed.sql` in the SQL editor. `seed.sql` is gitignored.
5. Project Settings → API. Copy the project URL and the anon key into `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Leave the service-role key on the Supabase site.

On Windows: `Copy-Item .env.example .env.local`

Do not commit real keys. Do not put the service-role key in frontend env. `.env.local` is ignored by Git.

Restart `npm run dev` after saving `.env.local`. Public pages then read active campaigns. Organisation queries must name their columns. `select *` on `organizations` fails because `owner_user_id` is not granted to the browser.

`supabase/refresh-demo-copy.sql` and `supabase/presentation-data.sql` adjust an existing demo database. They are not a substitute for the migration and seed.

## Checks

Run these in the SQL editor after the seed. Each block rolls back. Stop if one fails, before anyone enters a real contact detail.

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

A normal pledge counts as pledged, not received, and the result has no donor fields. The rollback then removes it:

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

The count should be 0. In the summary, `money_pledged` should be 100 and `money_received` should be 0.
