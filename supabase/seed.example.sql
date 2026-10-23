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
    'Setu Community Collective',
    'Fictional organisation for the SevaBridge prototype. It is not a registered NGO, and these campaigns are not real appeals.',
    null
  )
  returning id into org_id;

  insert into public.campaigns (
    organization_id, title, summary, description, category, campaign_mode, status, cover_image_url
  )
  values (
    org_id,
    'Notebooks for an after-school class in Nagpur',
    'An after-school class in Nagpur is asking for 40 notebooks and 100 pencils.',
    'The class meets after school in Nagpur and is short of stationery. The request is 40 notebooks and 100 pencils, handed over in person. A pledge is recorded here and counts as received only after the organisation confirms it. This is an illustrative campaign for the SevaBridge prototype, not a real appeal.',
    'education',
    'items',
    'active',
    '/images/supplies.jpg'
  )
  returning id into books_id;

  insert into public.campaign_item_needs (campaign_id, item_name, description, quantity_needed, unit)
  values
    (books_id, 'Notebooks', 'Ruled notebooks for students', 40, 'pieces'),
    (books_id, 'Pencils', 'Ordinary pencils', 100, 'pieces');

  insert into public.campaigns (
    organization_id, title, summary, description, category, campaign_mode, money_goal, status, cover_image_url
  )
  values (
    org_id,
    'A week of meals for a community kitchen',
    'A kitchen in Pune is raising ₹25,000 for rice, dal and fuel for one week of meals.',
    'The kitchen serves a weekday lunch. This goal is for rice, dal, oil and cooking fuel for about a week. SevaBridge does not collect the money. The organisation receives it in person. This is an illustrative campaign for the SevaBridge prototype, not a real appeal.',
    'essentials',
    'money',
    25000,
    'active',
    '/images/meals.jpg'
  )
  returning id into rice_id;

  insert into public.campaigns (
    organization_id, title, summary, description, category, campaign_mode, money_goal, status
  )
  values (
    org_id,
    'Essential supplies for a rural health camp',
    'Unpublished draft for hygiene kits and basic supplies. It must stay off the public site.',
    'A community health day would ask for hygiene kits and other non-prescription supplies. This row is a draft and is not a public campaign. It is illustrative, not a real appeal.',
    'healthcare',
    'both',
    5000,
    'draft'
  );

  insert into public.campaign_updates (campaign_id, title, body, created_by)
  values (
    books_id,
    'The after-school class list is open',
    'The campaign is published so a pledge can be recorded. No distribution has been organised. This is a prototype note.',
    demo_user
  );
end $$;
