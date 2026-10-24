-- Populate the existing prototype with one organisation, two more campaigns,
-- pledges, and updates. Run this whole file once in the Supabase SQL editor.
-- It does not change tables, policies, or auth. A second run does not add
-- duplicate pledges. If a check fails, the whole run is rolled back.
-- Do not run supabase/seed.sql.

do $body$
declare
  org uuid := '3b6bda09-ebc0-48f1-bf55-07c81126d469';
  owner uuid;
  nagpur uuid := '881a482d-cb4b-4f57-9fc0-0f812df71792';
  meals uuid := 'a0fb4a66-c34d-478d-8834-4f16967650c8';
  bottles uuid := '3c45aedd-9e47-44fa-8171-0f408adc3af3';
  evening uuid := '0fadbb67-6984-48ad-a986-6c7b4d960903';
  hadapsar uuid := '1c10fdf1-b73b-4e0e-92e3-04a53c126ac5';
  reading uuid := 'c6b8b2c7-5082-40b4-bd93-39ec97fa2d46';
  hygiene uuid;
  blankets uuid;
  kits uuid;
  wool uuid;
  shawls uuid;
  pledge record;
begin
  select owner_user_id into owner from public.organizations where id = org;
  if owner is null then
    raise exception 'Organisation was not found. Nothing was changed.';
  end if;

  perform set_config('request.jwt.claim.sub', owner::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', owner)::text, true);
  if auth.uid() is distinct from owner then
    raise exception 'Could not attribute updates to the organisation owner. Nothing was changed.';
  end if;

  if (
    select count(*)
    from public.campaigns
    where organization_id = org
      and id in (nagpur, meals, bottles, evening, hadapsar, reading)
      and status = 'active'
  ) <> 6 then
    raise exception 'The six active campaigns were not all found. Nothing was changed.';
  end if;

  update public.organizations
  set
    name = 'Pune Community Learning Foundation',
    description = 'A community organisation in Pune. It publishes what a neighbourhood needs and records pledges that are handed over in person.'
  where id = org;

  update public.campaigns set
    description = 'The evening centre in Kothrud, Pune, runs a free study hour on weekdays. It needs 80 ruled notebooks and 150 pencils. Items are collected in person.',
    cover_image_url = '/images/cause-education.jpg'
  where id = evening;

  update public.campaigns set
    description = 'An after-school class in Nagpur needs 40 notebooks and 100 pencils. Items are handed over in person.',
    cover_image_url = '/images/supplies.jpg'
  where id = nagpur;

  update public.campaigns set
    description = 'A Saturday class in Pune meets in a community room and needs 12 reusable water bottles. Bottles are handed over in person.',
    cover_image_url = '/images/bottle.jpg'
  where id = bottles;

  update public.campaigns set
    description = 'A community kitchen in Pune serves a weekday lunch. The goal is ₹25,000 for rice, dal, oil and cooking fuel for about a week. Money is handed over in person.',
    cover_image_url = '/images/meals.jpg'
  where id = meals;

  update public.campaigns set
    description = 'The weekly kitchen in Hadapsar, Pune, cooks one large meal each week. This campaign covers rice, dal and oil, with a goal of ₹18,000. Money is handed over in person.',
    cover_image_url = '/images/dal.jpg'
  where id = hadapsar;

  update public.campaigns set
    description = 'The neighbourhood reading room is in Pune. The roof leaks, so the request is 8 tarpaulin sheets and ₹15,000 for patching and mats. Collection is arranged in person.',
    cover_image_url = '/images/library.jpg'
  where id = reading;

  update public.campaigns set
    title = 'Essential supplies for a rural health camp',
    summary = 'A health day near Pune would ask for hygiene kits and basic supplies.',
    description = 'A health day in a village near Pune would ask for hygiene kits and basic supplies. This campaign is still a draft.',
    cover_image_url = '/images/cause-healthcare.jpg'
  where organization_id = org
    and status = 'draft'
    and title in ('Demo draft: neighbourhood clinic day', 'Essential supplies for a rural health camp');

  update public.campaign_updates
  set body = 'The after-school class in Nagpur is open for notebook and pencil pledges. Handover is arranged in person.'
  where id = 'a2b8876e-1720-41f8-889c-949de8030f4b' and campaign_id = nagpur;

  update public.campaign_updates
  set body = 'Two notebooks were marked received after the handover.'
  where id = '3cd225d2-96e7-4cd9-a380-2737a3b1b215' and campaign_id = nagpur;

  select id into hygiene
  from public.campaigns
  where organization_id = org and title = 'Hygiene kits for a community outreach programme';
  if hygiene is null then
    insert into public.campaigns (
      organization_id, title, summary, description, category, campaign_mode, cover_image_url, money_goal, status
    ) values (
      org,
      'Hygiene kits for a community outreach programme',
      'An outreach programme in Pimpri is asking for 40 hygiene kits.',
      'The outreach programme in Pimpri, Pune, is packing kits for women and adolescent girls. Each kit holds soap, sanitary pads and a towel. The request is 40 kits, collected in person.',
      'healthcare',
      'items',
      '/images/cause-healthcare.jpg',
      null,
      'active'
    )
    returning id into hygiene;
  end if;

  select id into blankets
  from public.campaigns
  where organization_id = org and title = 'Blankets and warm clothing for a winter drive';
  if blankets is null then
    insert into public.campaigns (
      organization_id, title, summary, description, category, campaign_mode, cover_image_url, money_goal, status
    ) values (
      org,
      'Blankets and warm clothing for a winter drive',
      'A winter drive in Aundh is asking for 30 blankets and 20 shawls.',
      'A winter drive in Aundh, Pune, is collecting warm clothing. The request is 30 wool blankets and 20 shawls, handed over in person.',
      'community',
      'items',
      '/images/blankets.jpg',
      null,
      'active'
    )
    returning id into blankets;
  end if;

  update public.campaigns
  set cover_image_url = '/images/blankets.jpg'
  where id = blankets;

  insert into public.campaign_item_needs (campaign_id, item_name, description, quantity_needed, unit)
  select hygiene, 'Hygiene kits', 'Soap, sanitary pads and a towel', 40, 'kits'
  where not exists (
    select 1 from public.campaign_item_needs where campaign_id = hygiene and item_name = 'Hygiene kits'
  );
  insert into public.campaign_item_needs (campaign_id, item_name, description, quantity_needed, unit)
  select blankets, 'Wool blankets', 'Warm blankets for the winter drive', 30, 'pieces'
  where not exists (
    select 1 from public.campaign_item_needs where campaign_id = blankets and item_name = 'Wool blankets'
  );
  insert into public.campaign_item_needs (campaign_id, item_name, description, quantity_needed, unit)
  select blankets, 'Shawls', 'Shawls for the winter drive', 20, 'pieces'
  where not exists (
    select 1 from public.campaign_item_needs where campaign_id = blankets and item_name = 'Shawls'
  );

  select id into kits from public.campaign_item_needs where campaign_id = hygiene and item_name = 'Hygiene kits';
  select id into wool from public.campaign_item_needs where campaign_id = blankets and item_name = 'Wool blankets';
  select id into shawls from public.campaign_item_needs where campaign_id = blankets and item_name = 'Shawls';

  create temp table presentation_pledges (
    donor_email text primary key,
    campaign_id uuid not null,
    commitment_type text not null,
    item_need_id uuid,
    donor_name text not null,
    amount numeric,
    quantity integer,
    mark_received boolean not null
  ) on commit drop;

  insert into presentation_pledges values
    ('rohan.deshmukh.tarp@example.com', reading, 'item', '95666711-9421-4f15-b433-227aaa2528fe', 'Rohan Deshmukh', null, 1, true),
    ('sneha.pawar.tarp@example.com', reading, 'item', '95666711-9421-4f15-b433-227aaa2528fe', 'Sneha Pawar', null, 2, false),
    ('imran.shaikh.repair@example.com', reading, 'money', null, 'Imran Shaikh', 2000, null, true),
    ('kavita.more.repair@example.com', reading, 'money', null, 'Kavita More', 2500, null, false),
    ('yusuf.khan.kitchen@example.com', hadapsar, 'money', null, 'Yusuf Khan', 4000, null, true),
    ('lata.shinde.kitchen@example.com', hadapsar, 'money', null, 'Lata Shinde', 2200, null, false),
    ('priya.kulkarni.books@example.com', evening, 'item', '0dbab003-1b72-437f-8602-979d2676c117', 'Priya Kulkarni', null, 15, true),
    ('amit.bhosale.books@example.com', evening, 'item', '0dbab003-1b72-437f-8602-979d2676c117', 'Amit Bhosale', null, 11, false),
    ('neha.joshi.pencils@example.com', evening, 'item', 'f8afa765-46c7-4cca-b636-fdd9c89125e4', 'Neha Joshi', null, 10, true),
    ('rahul.patil.pencils@example.com', evening, 'item', 'f8afa765-46c7-4cca-b636-fdd9c89125e4', 'Rahul Patil', null, 30, false),
    ('asha.mane.bottles@example.com', bottles, 'item', '9eccf725-041c-4d63-bd1c-ee42a0316539', 'Asha Mane', null, 4, false),
    ('vikram.deshpande.books@example.com', nagpur, 'item', '2a5c424d-5202-4802-a734-0fc1173efda6', 'Vikram Deshpande', null, 8, false),
    ('farida.qureshi.pencils@example.com', nagpur, 'item', '111eba0c-f733-419a-9e0c-a512ecfb0cee', 'Farida Qureshi', null, 18, false),
    ('sunita.gaikwad.meals@example.com', meals, 'money', null, 'Sunita Gaikwad', 5500, null, true),
    ('arjun.rao.meals@example.com', meals, 'money', null, 'Arjun Rao', 2800, null, false),
    ('meera.joshi.kits@example.com', hygiene, 'item', kits, 'Meera Joshi', null, 11, true),
    ('pooja.naik.kits@example.com', hygiene, 'item', kits, 'Pooja Naik', null, 7, false),
    ('sachin.kale.blankets@example.com', blankets, 'item', wool, 'Sachin Kale', null, 7, true),
    ('nisha.bhide.blankets@example.com', blankets, 'item', wool, 'Nisha Bhide', null, 5, false),
    ('omar.sheikh.shawls@example.com', blankets, 'item', shawls, 'Omar Sheikh', null, 6, false);

  for pledge in select * from presentation_pledges loop
    if not exists (select 1 from public.commitments where donor_email = pledge.donor_email) then
      insert into public.commitments (
        campaign_id, commitment_type, item_need_id, donor_name, donor_email, amount, quantity, status
      ) values (
        pledge.campaign_id,
        pledge.commitment_type,
        pledge.item_need_id,
        pledge.donor_name,
        pledge.donor_email,
        pledge.amount,
        pledge.quantity,
        'pending'
      );
    end if;
    if pledge.mark_received then
      update public.commitments
      set status = 'fulfilled'
      where donor_email = pledge.donor_email and status = 'pending';
    end if;
  end loop;

  if exists (
    select 1
    from public.campaign_item_needs n
    join lateral (
      select coalesce(sum(m.quantity) filter (where m.status = 'fulfilled'), 0) as received
      from public.commitments m
      where m.item_need_id = n.id and m.commitment_type = 'item'
    ) totals on true
    where n.campaign_id in (nagpur, meals, bottles, evening, hadapsar, reading, hygiene, blankets)
      and totals.received > n.quantity_needed
  ) then
    raise exception 'A received quantity is above the amount requested. Nothing was kept.';
  end if;

  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select reading, 'The reading room request is open', 'The Pune reading room is asking for 8 tarpaulin sheets and ₹15,000 for repairs. Handover is arranged in person.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = reading and title = 'The reading room request is open');
  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select reading, 'One tarpaulin sheet marked received', 'One tarpaulin sheet and ₹2,000 of the repair money have been marked received.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = reading and title = 'One tarpaulin sheet marked received');

  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select hadapsar, 'The Hadapsar kitchen list is open', 'The weekly kitchen in Hadapsar is raising ₹18,000 for rice, dal and oil.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = hadapsar and title = 'The Hadapsar kitchen list is open');
  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select hadapsar, 'Part of the kitchen money marked received', '₹4,000 of the Hadapsar kitchen pledges has been marked received.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = hadapsar and title = 'Part of the kitchen money marked received');

  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select evening, 'The Kothrud study hour is open', 'The evening centre in Kothrud is asking for 80 ruled notebooks and 150 pencils.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = evening and title = 'The Kothrud study hour is open');
  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select evening, 'Notebooks and pencils marked received', 'Fifteen ruled notebooks and ten pencils have been marked received.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = evening and title = 'Notebooks and pencils marked received');

  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select bottles, 'The Saturday class is asking for bottles', 'The class in Pune is asking for 12 reusable water bottles. None have been marked received yet.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = bottles and title = 'The Saturday class is asking for bottles');

  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select meals, 'The community kitchen week is open', 'The Pune kitchen is raising ₹25,000 for rice, dal, oil and cooking fuel.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = meals and title = 'The community kitchen week is open');
  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select meals, 'Part of the meal money marked received', 'Some of the pledged kitchen money has been marked received after handover.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = meals and title = 'Part of the meal money marked received');

  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select hygiene, 'The Pimpri outreach list is open', 'The outreach programme is asking for 40 hygiene kits.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = hygiene and title = 'The Pimpri outreach list is open');
  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select hygiene, 'Eleven hygiene kits marked received', 'Eleven hygiene kits have been marked received.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = hygiene and title = 'Eleven hygiene kits marked received');

  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select blankets, 'The Aundh winter list is open', 'The winter drive is asking for 30 wool blankets and 20 shawls.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = blankets and title = 'The Aundh winter list is open');
  insert into public.campaign_updates (campaign_id, title, body, created_by)
  select blankets, 'Seven blankets marked received', 'Seven wool blankets have been marked received. Shawls are still only pledged.', owner
  where not exists (select 1 from public.campaign_updates where campaign_id = blankets and title = 'Seven blankets marked received');

  update public.campaign_updates set published_at = timestamptz '2026-10-14 10:00:00+05:30'
  where campaign_id = reading and title = 'The reading room request is open';
  update public.campaign_updates set published_at = timestamptz '2026-10-21 16:00:00+05:30'
  where campaign_id = reading and title = 'One tarpaulin sheet marked received';
  update public.campaign_updates set published_at = timestamptz '2026-10-13 11:00:00+05:30'
  where campaign_id = hadapsar and title = 'The Hadapsar kitchen list is open';
  update public.campaign_updates set published_at = timestamptz '2026-10-22 15:00:00+05:30'
  where campaign_id = hadapsar and title = 'Part of the kitchen money marked received';
  update public.campaign_updates set published_at = timestamptz '2026-10-13 09:30:00+05:30'
  where campaign_id = evening and title = 'The Kothrud study hour is open';
  update public.campaign_updates set published_at = timestamptz '2026-10-22 18:00:00+05:30'
  where campaign_id = evening and title = 'Notebooks and pencils marked received';
  update public.campaign_updates set published_at = timestamptz '2026-10-16 12:00:00+05:30'
  where campaign_id = bottles and title = 'The Saturday class is asking for bottles';
  update public.campaign_updates set published_at = timestamptz '2026-10-15 10:30:00+05:30'
  where campaign_id = meals and title = 'The community kitchen week is open';
  update public.campaign_updates set published_at = timestamptz '2026-10-23 17:00:00+05:30'
  where campaign_id = meals and title = 'Part of the meal money marked received';
  update public.campaign_updates set published_at = timestamptz '2026-10-20 11:00:00+05:30'
  where campaign_id = hygiene and title = 'The Pimpri outreach list is open';
  update public.campaign_updates set published_at = timestamptz '2026-10-23 12:30:00+05:30'
  where campaign_id = hygiene and title = 'Eleven hygiene kits marked received';
  update public.campaign_updates set published_at = timestamptz '2026-10-20 14:00:00+05:30'
  where campaign_id = blankets and title = 'The Aundh winter list is open';
  update public.campaign_updates set published_at = timestamptz '2026-10-23 19:00:00+05:30'
  where campaign_id = blankets and title = 'Seven blankets marked received';
end
$body$;
