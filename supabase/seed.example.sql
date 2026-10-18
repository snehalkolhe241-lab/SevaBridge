-- Demo organisation and sample campaigns.
-- 1. Copy this file to supabase/seed.sql.
-- 2. Create the NGO user in Supabase Authentication first.
-- 3. Replace the placeholder uuid below with that user's id.
-- 4. Run supabase/seed.sql in the SQL editor.
--
-- seed.sql is gitignored because it holds the real user id.
-- This example stays on the placeholder. There are no donor contacts in this seed.

do $$
declare
  demo_user uuid := '00000000-0000-0000-0000-000000000000';
  org_id uuid;
  books_id uuid;
  rice_id uuid;
begin
  if demo_user = '00000000-0000-0000-0000-000000000000' then
    raise exception 'Replace demo_user in supabase/seed.sql with the Auth user id before running it';
  end if;

  if not exists (select 1 from auth.users where id = demo_user) then
    raise exception 'No Auth user exists with that id';
  end if;

  if exists (
    select 1
    from public.commitments pledge
    join public.campaigns camp on camp.id = pledge.campaign_id
    join public.organizations org on org.id = camp.organization_id
    where org.owner_user_id = demo_user
  ) then
    raise exception 'This user already has pledges. Seed will not delete them.';
  end if;

  delete from public.organizations where owner_user_id = demo_user;

  perform set_config('request.jwt.claim.sub', demo_user::text, true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', demo_user, 'role', 'authenticated')::text,
    true
  );

  insert into public.organizations (owner_user_id, name, description, public_contact_email)
  values (
    demo_user,
    'SevaBridge Demo Collective',
    'Sample organisation for a student demo. This is not a real NGO, and the campaigns are not real appeals.',
    null
  )
  returning id into org_id;

  insert into public.campaigns (
    organization_id, title, summary, description, category, campaign_mode, status
  )
  values (
    org_id,
    'Demo: notebooks for an after-school class',
    'Sample campaign. Visitors can pledge notebooks or pencils. Nothing here is a real request.',
    'This demonstration campaign asks for stationery. Handover would happen offline with the organisation. Do not treat the totals as real donations.',
    'education',
    'items',
    'active'
  )
  returning id into books_id;

  insert into public.campaign_item_needs (campaign_id, item_name, description, quantity_needed, unit)
  values
    (books_id, 'Notebooks', 'Ruled notebooks for students', 40, 'pieces'),
    (books_id, 'Pencils', 'Ordinary pencils', 100, 'pieces');

  insert into public.campaigns (
    organization_id, title, summary, description, category, campaign_mode, money_goal, status
  )
  values (
    org_id,
    'Demo: rice purchase fund',
    'Sample money campaign. A pledge records an intended amount and does not transfer money.',
    'This demonstration campaign has a monetary goal so the received-versus-pledged display can be shown. SevaBridge does not collect the money.',
    'essentials',
    'money',
    25000,
    'active'
  )
  returning id into rice_id;

  insert into public.campaigns (
    organization_id, title, summary, description, category, campaign_mode, money_goal, status
  )
  values (
    org_id,
    'Demo draft: neighbourhood clinic day',
    'Sample draft. This campaign must stay off the public site.',
    'Draft used to check that unpublished campaigns are not publicly readable.',
    'healthcare',
    'both',
    5000,
    'draft'
  );

  insert into public.campaign_updates (campaign_id, title, body, created_by)
  values (
    books_id,
    'Demo update: campaign opened',
    'Sample update for the public campaign page. No activity has taken place.',
    demo_user
  );
end $$;
